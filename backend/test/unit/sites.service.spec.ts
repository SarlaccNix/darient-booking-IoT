import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SitesService } from '../../src/services/sites.service';
import { PrismaService } from '../../src/prisma/prisma.service';

const mockPrisma = {
  site: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockSite = (overrides = {}) => ({
  id: 'site_1',
  name: 'Alpha Tower',
  latitude: 8.9943,
  longitude: -79.5188,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('SitesService', () => {
  let service: SitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SitesService>(SitesService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should throw 404 when site does not exist', async () => {
      mockPrisma.site.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toThrow(NotFoundException);
    });

    it('should return site when it exists', async () => {
      mockPrisma.site.findUnique.mockResolvedValue(mockSite());
      const result = await service.findOne('site_1');
      expect(result.name).toBe('Alpha Tower');
    });
  });

  describe('create', () => {
    it('should create a new site', async () => {
      const dto = { name: 'Beta Hub', latitude: 8.9936, longitude: -79.5201 };
      mockPrisma.site.create.mockResolvedValue(mockSite({ ...dto, id: 'site_2' }));
      const result = await service.create(dto);
      expect(result.name).toBe('Beta Hub');
      expect(mockPrisma.site.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should throw 404 when updating non-existent site', async () => {
      mockPrisma.site.findUnique.mockResolvedValue(null);
      await expect(service.update('bad_id', { name: 'New Name' })).rejects.toThrow(NotFoundException);
    });

    it('should update the site when it exists', async () => {
      const updated = mockSite({ name: 'Updated Name' });
      mockPrisma.site.findUnique.mockResolvedValue(mockSite());
      mockPrisma.site.update.mockResolvedValue(updated);
      const result = await service.update('site_1', { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('should throw 404 when removing non-existent site', async () => {
      mockPrisma.site.findUnique.mockResolvedValue(null);
      await expect(service.remove('bad_id')).rejects.toThrow(NotFoundException);
    });

    it('should delete the site when it exists', async () => {
      mockPrisma.site.findUnique.mockResolvedValue(mockSite());
      mockPrisma.site.delete.mockResolvedValue(mockSite());
      await service.remove('site_1');
      expect(mockPrisma.site.delete).toHaveBeenCalledWith({ where: { id: 'site_1' } });
    });
  });
});
