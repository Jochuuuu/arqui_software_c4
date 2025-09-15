import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DownloadsService } from './downloads.service';

describe('DownloadsService', () => {
  let service: DownloadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DownloadsService],
    }).compile();

    service = module.get<DownloadsService>(DownloadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDownloadToken', () => {
    it('should generate token for owned game', async () => {
      const result = await service.generateDownloadToken('game-001', '1', {});
      
      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.gameId).toBe('game-001');
      expect(result.userId).toBe('1');
      expect(result.maxDownloads).toBe(5);
    });

    it('should throw forbidden for unowned game', async () => {
      await expect(
        service.generateDownloadToken('game-999', '1', {})
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getDownloadStatus', () => {
    it('should return status for existing download', async () => {
      // First generate token to create status
      await service.generateDownloadToken('game-001', '1', {});
      
      const status = await service.getDownloadStatus('game-001', '1');
      expect(status).toBeDefined();
      expect(status.gameId).toBe('game-001');
      expect(status.userId).toBe('1');
    });

    it('should throw not found for non-existing download', async () => {
      await expect(
        service.getDownloadStatus('game-999', '1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGameBlocks', () => {
    it('should return blocks for owned game', async () => {
      const blocks = await service.getGameBlocks('game-001', '1');
      
      expect(blocks).toBeDefined();
      expect(Array.isArray(blocks)).toBe(true);
      expect(blocks.length).toBeGreaterThan(0);
      expect(blocks[0].gameId).toBe('game-001');
    });

    it('should throw forbidden for unowned game', async () => {
      await expect(
        service.getGameBlocks('game-001', '999')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getCDNServers', () => {
    it('should return all active servers', async () => {
      const servers = await service.getCDNServers();
      
      expect(servers).toBeDefined();
      expect(Array.isArray(servers)).toBe(true);
      expect(servers.every(s => s.active)).toBe(true);
    });

    it('should filter by region', async () => {
      const servers = await service.getCDNServers('south-america');
      
      expect(servers).toBeDefined();
      expect(servers.every(s => s.region === 'south-america')).toBe(true);
    });
  });
});