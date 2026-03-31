import { Injectable, OnModuleInit } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { MqttService, TelemetryPayload } from './mqtt.service';

@Injectable()
export class TelemetryService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mqtt: MqttService,
  ) {}

  onModuleInit() {
    this.mqtt.telemetry$.subscribe((payload) => {
      this.persistReading(payload).catch((err) =>
        console.error('Failed to persist telemetry', err),
      );
    });
  }

  get telemetry$(): Observable<TelemetryPayload> {
    return this.mqtt.telemetry$.asObservable();
  }

  private async persistReading(p: TelemetryPayload) {
    // Verify the space exists before writing — silently skip unknown offices
    const space = await this.prisma.space.findUnique({ where: { id: p.spaceId } });
    if (!space) return;

    await this.prisma.telemetry.create({
      data: {
        spaceId: p.spaceId,
        siteId: p.siteId,
        tempC: p.temp_c,
        humidityPct: p.humidity_pct,
        co2Ppm: p.co2_ppm,
        occupancy: p.occupancy,
        powerW: p.power_w,
        recordedAt: new Date(p.ts),
      },
    });
  }

  async findLatestAll() {
    return this.prisma.telemetry.findMany({
      distinct: ['spaceId'],
      orderBy: { recordedAt: 'desc' },
      include: {
        space: { select: { id: true, name: true, capacity: true } },
        site: { select: { id: true, name: true } },
      },
    });
  }

  async findLatest(spaceId: string) {
    return this.prisma.telemetry.findFirst({
      where: { spaceId },
      orderBy: { recordedAt: 'desc' },
      include: {
        space: { select: { id: true, name: true, capacity: true } },
        site: { select: { id: true, name: true } },
      },
    });
  }

  async findHistory(spaceId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.telemetry.findMany({
        where: { spaceId },
        orderBy: { recordedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.telemetry.count({ where: { spaceId } }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }
}
