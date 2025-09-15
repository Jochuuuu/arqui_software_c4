export interface Game {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: PriceInfo;
  category: string;
  publisher: string;
  releaseDate: Date;
  rating: number; // 1-5 stars
  tags: string[];
  screenshots: string[];
  systemRequirements: SystemRequirements;
  downloadInfo: DownloadInfo;
  featured: boolean;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceInfo {
  USD: number;
  PEN: number;
  MXN: number;
  ARS: number;
  EUR?: number;
}

export interface SystemRequirements {
  minimum: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
  recommended: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
}

export interface DownloadInfo {
  sizeGB: number;
  totalBlocks: number;
  cdnRegions: string[];
  checksums: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  gameCount: number;
}

export interface Publisher {
  id: string;
  name: string;
  description: string;
  website: string;
  gameCount: number;
}

export interface GameSearchFilters {
  category?: string;
  publisher?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  tags?: string[];
  featured?: boolean;
  available?: boolean;
}