import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SpacesService } from '../../src/services/spaces.service';
import { PrismaService } from '../../src/prisma/prisma.service';

const mockPrisma = {
  space: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  site: {
    findUnique: jest.fn(),
  },
};

const mockSpace = (overrides = {}) => ({
  id: 'space_1',
  siteId: 'site_1',
  name: 'Board Room',
  capacity: 12,
  locationReference: 'Floor 3',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  site: { id: 'site_1', name: 'Alpha Tower' },
  ...overrides,
});

describe('SpacesService', () => {
  let service: SpacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpacesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SpacesService>(SpacesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw 404 when siteId does not exist', async () => {
      mockPrisma.site.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ siteId: 'bad_site', name: 'Test', capacity: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create space when siteId is valid', async () => {
      mockPrisma.site.findUnique.mockResolvedValue({ id: 'site_1', name: 'Alpha Tower' });
      mockPrisma.space.create.mockResolvedValue(mockSpace());

      const result = await service.create({ siteId: 'site_1', name: 'Board Room', capacity: 12 });
      expect(result.name).toBe('Board Room');
      expect(mockPrisma.space.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should throw 404 when space does not exist', async () => {
      mockPrisma.space.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toThrow(NotFoundException);
    });

    it('should return space when it exists', async () => {
      mockPrisma.space.findUnique.mockResolvedValue(mockSpace());
      const result = await service.findOne('space_1');
      expect(result.id).toBe('space_1');
    });
  });

  describe('findAll', () => {
    it('should filter by siteId when provided', async () => {
      mockPrisma.space.findMany.mockResolvedValue([mockSpace()]);
      await service.findAll('site_1');

      expect(mockPrisma.space.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { siteId: 'site_1' } }),
      );
    });

    it('should return all spaces when siteId is not provided', async () => {
      mockPrisma.space.findMany.mockResolvedValue([mockSpace(), mockSpace({ id: 'space_2' })]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });
});
