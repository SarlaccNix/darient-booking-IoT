import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from '../dto/bookings/create-booking.dto';
import { UpdateBookingDto } from '../dto/bookings/update-booking.dto';
import { BookingQueryDto } from '../dto/bookings/booking-query.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BookingQueryDto) {
    const { page = 1, pageSize = 10, spaceId, clientEmail } = query;
    const skip = (page - 1) * pageSize;

    const where = {
      ...(spaceId ? { spaceId } : {}),
      ...(clientEmail ? { clientEmail } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          space: { select: { id: true, name: true } },
          site: { select: { id: true, name: true } },
        },
        orderBy: { bookingDate: 'asc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        space: { select: { id: true, name: true } },
        site: { select: { id: true, name: true } },
      },
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async create(dto: CreateBookingDto) {
    const space = await this.prisma.space.findUnique({
      where: { id: dto.spaceId },
    });
    if (!space) throw new NotFoundException(`Space ${dto.spaceId} not found`);

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    const bookingDate = new Date(dto.bookingDate);
    const weekStart = this.getIsoWeekStart(bookingDate);

    await this.checkTimeConflict(dto.spaceId, startTime, endTime);

    return this.prisma.$transaction(async (tx) => {
      // Business Rule 2: check summary counter atomically
      const summary = await tx.bookingWeeklySummary.findUnique({
        where: {
          clientEmail_weekStart: { clientEmail: dto.clientEmail, weekStart },
        },
      });
      if (summary && summary.count >= 3) {
        throw new UnprocessableEntityException(
          'You have reached the 3 booking limit for this week',
        );
      }

      const booking = await tx.booking.create({
        data: {
          spaceId: dto.spaceId,
          siteId: space.siteId,
          clientEmail: dto.clientEmail,
          bookingDate,
          startTime,
          endTime,
        },
        include: {
          space: { select: { id: true, name: true } },
          site: { select: { id: true, name: true } },
        },
      });

      await tx.bookingWeeklySummary.upsert({
        where: {
          clientEmail_weekStart: { clientEmail: dto.clientEmail, weekStart },
        },
        create: { clientEmail: dto.clientEmail, weekStart, count: 1 },
        update: { count: { increment: 1 } },
      });

      return booking;
    });
  }

  async update(id: string, dto: UpdateBookingDto) {
    const existing = await this.findOne(id);

    const startTime = dto.startTime
      ? new Date(dto.startTime)
      : existing.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : existing.endTime;
    const bookingDate = dto.bookingDate
      ? new Date(dto.bookingDate)
      : existing.bookingDate;
    const spaceId = dto.spaceId ?? existing.spaceId;
    const clientEmail = dto.clientEmail ?? existing.clientEmail;

    if (dto.spaceId && dto.spaceId !== existing.spaceId) {
      const space = await this.prisma.space.findUnique({
        where: { id: dto.spaceId },
      });
      if (!space) throw new NotFoundException(`Space ${dto.spaceId} not found`);
    }

    await this.checkTimeConflict(spaceId, startTime, endTime, id);

    const oldWeekStart = this.getIsoWeekStart(existing.bookingDate);
    const newWeekStart = this.getIsoWeekStart(bookingDate);
    const weekChanged =
      newWeekStart.getTime() !== oldWeekStart.getTime() ||
      clientEmail !== existing.clientEmail;

    const updateData: Record<string, unknown> = {};
    if (dto.clientEmail !== undefined) updateData.clientEmail = dto.clientEmail;
    if (dto.bookingDate !== undefined) updateData.bookingDate = bookingDate;
    if (dto.startTime !== undefined) updateData.startTime = startTime;
    if (dto.endTime !== undefined) updateData.endTime = endTime;
    if (dto.spaceId !== undefined) {
      updateData.spaceId = dto.spaceId;
      const space = await this.prisma.space.findUnique({
        where: { id: dto.spaceId },
      });
      if (space) updateData.siteId = space.siteId;
    }

    return this.prisma.$transaction(async (tx) => {
      if (weekChanged) {
        // Decrement old week counter
        await tx.bookingWeeklySummary.updateMany({
          where: { clientEmail: existing.clientEmail, weekStart: oldWeekStart },
          data: { count: { decrement: 1 } },
        });

        // Check new week counter before incrementing
        const summary = await tx.bookingWeeklySummary.findUnique({
          where: {
            clientEmail_weekStart: { clientEmail, weekStart: newWeekStart },
          },
        });
        if (summary && summary.count >= 3) {
          throw new UnprocessableEntityException(
            'You have reached the 3 booking limit for this week',
          );
        }

        await tx.bookingWeeklySummary.upsert({
          where: {
            clientEmail_weekStart: { clientEmail, weekStart: newWeekStart },
          },
          create: { clientEmail, weekStart: newWeekStart, count: 1 },
          update: { count: { increment: 1 } },
        });
      }

      return tx.booking.update({
        where: { id },
        data: updateData,
        include: {
          space: { select: { id: true, name: true } },
          site: { select: { id: true, name: true } },
        },
      });
    });
  }

  async remove(id: string) {
    const booking = await this.findOne(id);
    const weekStart = this.getIsoWeekStart(booking.bookingDate);

    return this.prisma.$transaction(async (tx) => {
      await tx.booking.delete({ where: { id } });
      // updateMany: safe if no summary row exists (e.g. legacy data)
      await tx.bookingWeeklySummary.updateMany({
        where: { clientEmail: booking.clientEmail, weekStart },
        data: { count: { decrement: 1 } },
      });
    });
  }

  // Business Rule 1: No time conflicts per space
  private async checkTimeConflict(
    spaceId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ) {
    const conflict = await this.prisma.booking.findFirst({
      where: {
        spaceId,
        id: excludeId ? { not: excludeId } : undefined,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (conflict) {
      throw new ConflictException(
        'This space is already booked for the selected time',
      );
    }
  }

  private getIsoWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
}
