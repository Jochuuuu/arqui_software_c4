import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DownloadToken, GameBlock, DownloadStatus, CDNServer, BlockVerificationResult } from './interfaces';
import { CreateDownloadTokenDto, VerifyBlockDto } from './dto';

@Injectable()
export class DownloadsService {
  // Mock data stores (in production: use database)
  private downloadTokens = new Map<string, DownloadToken>();
  private gameBlocks = new Map<string, GameBlock[]>();
  private downloadStatuses = new Map<string, DownloadStatus>();
  private cdnServers: CDNServer[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize CDN servers
    this.cdnServers = [
      {
        id: 'cdn-sa-1',
        region: 'south-america',
        country: 'BR',
        baseUrl: 'https://cdn-sa1.gameplatform.com',
        priority: 1,
        active: true,
        latency: 45,
        bandwidth: 1000,
        load: 25,
      },
      {
        id: 'cdn-sa-2',
        region: 'south-america',
        country: 'PE',
        baseUrl: 'https://cdn-sa2.gameplatform.com',
        priority: 2,
        active: true,
        latency: 38,
        bandwidth: 800,
        load: 15,
      },
      {
        id: 'cdn-na-1',
        region: 'north-america',
        country: 'US',
        baseUrl: 'https://cdn-na1.gameplatform.com',
        priority: 1,
        active: true,
        latency: 120,
        bandwidth: 2000,
        load: 45,
      },
    ];

    // Initialize game blocks for existing games
    this.initializeGameBlocks();
  }

  private initializeGameBlocks() {
    const gameIds = ['game-001', 'game-002', 'game-003', 'game-004', 'game-005'];
    
    gameIds.forEach(gameId => {
      const blocks: GameBlock[] = [];
      const totalBlocks = Math.floor(Math.random() * 50) + 10; // 10-60 blocks per game
      
      for (let i = 0; i < totalBlocks; i++) {
        blocks.push({
          id: `${gameId}-block-${i}`,
          gameId,
          blockNumber: i,
          size: Math.floor(Math.random() * 100 * 1024 * 1024) + 50 * 1024 * 1024, // 50-150MB per block
          checksum: `sha256:${randomUUID().replace(/-/g, '')}`,
          downloadUrl: `https://cdn.gameplatform.com/blocks/${gameId}/block-${i}.dat`,
          isRequired: i < totalBlocks * 0.8, // 80% required blocks
          compressionType: Math.random() > 0.5 ? 'gzip' : 'none',
        });
      }
      
      this.gameBlocks.set(gameId, blocks);
    });
  }

  async generateDownloadToken(gameId: string, userId: string, dto: CreateDownloadTokenDto): Promise<DownloadToken> {
    // Verify user owns the game (mock entitlement check)
    if (!this.hasGameEntitlement(userId, gameId)) {
      throw new ForbiddenException('User does not own this game');
    }

    const token = randomUUID();
    const region = dto.preferredRegion || this.getOptimalRegion(dto.country || 'PE');
    const downloadUrls = this.getCDNUrls(region);

    const downloadToken: DownloadToken = {
      token,
      gameId,
      userId,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      downloadUrls,
      region,
      maxDownloads: 5,
      usedDownloads: 0,
    };

    this.downloadTokens.set(token, downloadToken);

    // Initialize download status
    const blocks = this.gameBlocks.get(gameId) || [];
    const totalSize = blocks.reduce((sum, block) => sum + block.size, 0);
    
    const statusKey = `${userId}-${gameId}`;
    this.downloadStatuses.set(statusKey, {
      gameId,
      gameTitle: this.getGameTitle(gameId),
      userId,
      totalBlocks: blocks.length,
      downloadedBlocks: 0,
      totalSize,
      downloadedSize: 0,
      progress: 0,
      status: 'idle',
      downloadSpeed: 0,
      estimatedTimeRemaining: 0,
      lastActivity: new Date(),
      failedBlocks: [],
      activeToken: token,
    });

    return downloadToken;
  }

  async getDownloadStatus(gameId: string, userId: string): Promise<DownloadStatus> {
    const statusKey = `${userId}-${gameId}`;
    const status = this.downloadStatuses.get(statusKey);
    
    if (!status) {
      throw new NotFoundException('Download status not found');
    }

    // Simulate download progress if downloading
    if (status.status === 'downloading') {
      this.simulateDownloadProgress(status);
    }

    return status;
  }

  async getGameBlocks(gameId: string, userId: string): Promise<GameBlock[]> {
    if (!this.hasGameEntitlement(userId, gameId)) {
      throw new ForbiddenException('User does not own this game');
    }

    const blocks = this.gameBlocks.get(gameId);
    if (!blocks) {
      throw new NotFoundException('Game blocks not found');
    }

    return blocks;
  }

  async verifyBlock(blockId: string, userId: string, dto: VerifyBlockDto): Promise<BlockVerificationResult> {
    // Find the block
    let block: GameBlock | undefined;
    for (const blocks of this.gameBlocks.values()) {
      block = blocks.find(b => b.id === blockId);
      if (block) break;
    }

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    if (!this.hasGameEntitlement(userId, block.gameId)) {
      throw new ForbiddenException('User does not own this game');
    }

    const isValid = dto.checksum === block.checksum;
    
    // Update download status
    const statusKey = `${userId}-${block.gameId}`;
    const status = this.downloadStatuses.get(statusKey);
    if (status) {
      if (isValid) {
        status.downloadedBlocks += 1;
        status.downloadedSize += block.size;
        status.progress = (status.downloadedBlocks / status.totalBlocks) * 100;
        
        if (status.downloadedBlocks === status.totalBlocks) {
          status.status = 'completed';
        }
      } else {
        status.failedBlocks.push(blockId);
      }
      status.lastActivity = new Date();
    }

    return {
      blockId,
      isValid,
      actualChecksum: dto.checksum,
      expectedChecksum: block.checksum,
      retryRequired: !isValid,
      downloadUrl: !isValid ? block.downloadUrl : undefined,
    };
  }

  async getCDNServers(region?: string): Promise<CDNServer[]> {
    let servers = this.cdnServers.filter(s => s.active);
    
    if (region) {
      servers = servers.filter(s => s.region === region);
    }
    
    // Sort by priority and load
    return servers.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.load - b.load;
    });
  }

  async startDownload(gameId: string, userId: string): Promise<{ message: string; status: DownloadStatus }> {
    const statusKey = `${userId}-${gameId}`;
    const status = this.downloadStatuses.get(statusKey);
    
    if (!status) {
      throw new NotFoundException('Download not initialized. Generate token first.');
    }

    if (status.status === 'completed') {
      throw new BadRequestException('Game already downloaded');
    }

    status.status = 'downloading';
    status.downloadSpeed = Math.floor(Math.random() * 50 * 1024 * 1024) + 10 * 1024 * 1024; // 10-60 MB/s
    status.lastActivity = new Date();

    return {
      message: 'Download started successfully',
      status,
    };
  }

  async pauseDownload(gameId: string, userId: string): Promise<{ message: string }> {
    const statusKey = `${userId}-${gameId}`;
    const status = this.downloadStatuses.get(statusKey);
    
    if (!status) {
      throw new NotFoundException('Download status not found');
    }

    status.status = 'paused';
    status.downloadSpeed = 0;
    status.lastActivity = new Date();

    return { message: 'Download paused successfully' };
  }

  // Private helper methods
  private hasGameEntitlement(userId: string, gameId: string): boolean {
    // Mock entitlement check - in real app, check purchases/entitlements
    const mockEntitlements = new Map([
      ['1', ['game-001']], // User 1 owns game-001
      ['2', ['game-002']], // User 2 owns game-002
    ]);
    
    const userGames = mockEntitlements.get(userId) || [];
    return userGames.includes(gameId);
  }

  private getOptimalRegion(country: string): string {
    const regionMap: { [key: string]: string } = {
      'PE': 'south-america',
      'BR': 'south-america',
      'AR': 'south-america',
      'CL': 'south-america',
      'US': 'north-america',
      'CA': 'north-america',
      'MX': 'north-america',
    };
    
    return regionMap[country] || 'south-america';
  }

  private getCDNUrls(region: string): string[] {
    return this.cdnServers
      .filter(s => s.region === region && s.active)
      .sort((a, b) => a.priority - b.priority)
      .map(s => s.baseUrl);
  }

  private getGameTitle(gameId: string): string {
    const titles: { [key: string]: string } = {
      'game-001': 'Cyber Warriors 2077',
      'game-002': 'Medieval Legends Online',
      'game-003': 'Racing Thunder Championship',
      'game-004': 'Indie Puzzle Master',
      'game-005': 'Space Colony Builder',
    };
    
    return titles[gameId] || 'Unknown Game';
  }

  private simulateDownloadProgress(status: DownloadStatus) {
    if (status.status !== 'downloading') return;

    // Simulate some progress
    const progressIncrement = Math.random() * 2; // Random progress
    status.progress = Math.min(100, status.progress + progressIncrement);
    status.downloadedSize = Math.floor((status.progress / 100) * status.totalSize);
    status.downloadedBlocks = Math.floor((status.progress / 100) * status.totalBlocks);
    
    if (status.progress >= 100) {
      status.status = 'completed';
      status.downloadSpeed = 0;
    }
    
    status.estimatedTimeRemaining = status.downloadSpeed > 0 
      ? Math.floor((status.totalSize - status.downloadedSize) / status.downloadSpeed)
      : 0;
      
    status.lastActivity = new Date();
  }
}