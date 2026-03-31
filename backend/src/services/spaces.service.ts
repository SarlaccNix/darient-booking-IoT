import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto } from '../dto/spaces/create-space.dto';
import { UpdateSpaceDto } from '../dto/spaces/update-space.dto';

@Injectable()
export class SpacesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(siteId?: string) {
    return this.prisma.space.findMany({
      where: siteId ? { siteId } : undefined,
      include: { site: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const space = await this.prisma.space.findUnique({
      where: { id },
      include: { site: { select: { id: true, name: true } } },
    });
    if (!space) throw new NotFoundException(`Space ${id} not found`);
    return space;
  }

  async create(dto: CreateSpaceDto) {
    const site = await this.prisma.site.findUnique({ where: { id: dto.siteId } });
    if (!site) throw new NotFoundException(`Site ${dto.siteId} not found`);
    return this.prisma.space.create({ data: dto });
  }

  async update(id: string, dto: UpdateSpaceDto) {
    await this.findOne(id);
    if (dto.siteId) {
      const site = await this.prisma.site.findUnique({ where: { id: dto.siteId } });
      if (!site) throw new NotFoundException(`Site ${dto.siteId} not found`);
    }
    return this.prisma.space.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.space.delete({ where: { id } });
  }
}
