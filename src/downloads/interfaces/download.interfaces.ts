export interface DownloadToken {
  token: string;
  gameId: string;
  userId: string;
  expiresAt: Date;
  downloadUrls: string[];
  region: string;
  maxDownloads: number;
  usedDownloads: number;
}

export interface GameBlock {
  id: string;
  gameId: string;
  blockNumber: number;
  size: number; // bytes
  checksum: string;
  downloadUrl: string;
  isRequired: boolean;
  compressionType: 'none' | 'gzip' | 'brotli';
}

export interface DownloadStatus {
  gameId: string;
  gameTitle: string;
  userId: string;
  totalBlocks: number;
  downloadedBlocks: number;
  totalSize: number; // bytes
  downloadedSize: number; // bytes
  progress: number; // 0-100
  status: 'idle' | 'downloading' | 'paused' | 'completed' | 'failed' | 'verifying';
  downloadSpeed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
  lastActivity: Date;
  failedBlocks: string[];
  activeToken?: string;
}

export interface CDNServer {
  id: string;
  region: string;
  country: string;
  baseUrl: string;
  priority: number;
  active: boolean;
  latency: number; // milliseconds
  bandwidth: number; // mbps
  load: number; // 0-100%
}

export interface BlockVerificationResult {
  blockId: string;
  isValid: boolean;
  actualChecksum: string;
  expectedChecksum: string;
  retryRequired: boolean;
  downloadUrl?: string;
}