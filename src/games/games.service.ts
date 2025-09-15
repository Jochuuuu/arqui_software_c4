import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Game, Category, Publisher, GameSearchFilters } from './interfaces/game.interface';
import { SearchGamesDto } from './dto/search-games.dto';
import { CreateGameDto } from './dto/create-game.dto';

@Injectable()
export class GamesService {
  // SIMULACIÓN EN MEMORIA - Para POC
  private games: Game[] = [
    {
      id: 'game-001',
      title: 'Cyber Warriors 2077',
      description: 'Un épico juego de acción en primera persona ambientado en una metrópolis futurista. Combina elementos RPG con combate táctico intenso.',
      shortDescription: 'Acción futurista con elementos RPG',
      price: { USD: 59.99, PEN: 220.00, MXN: 1200.00, ARS: 15000.00 },
      category: 'Action',
      publisher: 'CyberStudio',
      releaseDate: new Date('2024-12-15'),
      rating: 4.8,
      tags: ['cyberpunk', 'action', 'rpg', 'multiplayer', 'first-person'],
      screenshots: [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800'
      ],
      systemRequirements: {
        minimum: {
          os: 'Windows 10 64-bit',
          processor: 'Intel Core i5-8400 / AMD Ryzen 5 2600',
          memory: '8 GB RAM',
          graphics: 'NVIDIA GTX 1060 6GB / AMD RX 580',
          storage: '85 GB available space'
        },
        recommended: {
          os: 'Windows 11 64-bit',
          processor: 'Intel Core i7-10700K / AMD Ryzen 7 3700X',
          memory: '16 GB RAM',
          graphics: 'NVIDIA RTX 3070 / AMD RX 6800',
          storage: '85 GB SSD space'
        }
      },
      downloadInfo: {
        sizeGB: 85.4,
        totalBlocks: 12,
        cdnRegions: ['us-east-1', 'sa-east-1', 'eu-west-1'],
        checksums: ['abc123def456', 'ghi789jkl012']
      },
      featured: true,
      available: true,
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-12-01')
    },
    {
      id: 'game-002',
      title: 'Medieval Legends Online',
      description: 'MMORPG medieval con combate en tiempo real, crafting avanzado y guilds masivas. Explora un mundo abierto lleno de dragones y misterios.',
      shortDescription: 'MMORPG medieval épico',
      price: { USD: 39.99, PEN: 150.00, MXN: 800.00, ARS: 10000.00 },
      category: 'RPG',
      publisher: 'MythicGames',
      releaseDate: new Date('2024-10-20'),
      rating: 4.6,
      tags: ['mmorpg', 'medieval', 'fantasy', 'crafting', 'guilds'],
      screenshots: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800'
      ],
      systemRequirements: {
        minimum: {
          os: 'Windows 10 64-bit',
          processor: 'Intel Core i3-8100 / AMD Ryzen 3 2200G',
          memory: '8 GB RAM',
          graphics: 'NVIDIA GTX 1050 Ti / AMD RX 570',
          storage: '50 GB available space'
        },
        recommended: {
          os: 'Windows 11 64-bit',
          processor: 'Intel Core i5-10400F / AMD Ryzen 5 3600',
          memory: '16 GB RAM',
          graphics: 'NVIDIA RTX 3060 / AMD RX 6600',
          storage: '50 GB SSD space'
        }
      },
      downloadInfo: {
        sizeGB: 47.2,
        totalBlocks: 8,
        cdnRegions: ['us-east-1', 'sa-east-1', 'eu-west-1'],
        checksums: ['mno345pqr678', 'stu901vwx234']
      },
      featured: true,
      available: true,
      createdAt: new Date('2024-09-15'),
      updatedAt: new Date('2024-11-20')
    },
    {
      id: 'game-003',
      title: 'Racing Thunder Championship',
      description: 'Simulador de carreras ultra-realista con física avanzada, más de 200 vehículos licenciados y circuitos de todo el mundo.',
      shortDescription: 'Simulador de carreras ultra-realista',
      price: { USD: 49.99, PEN: 185.00, MXN: 1000.00, ARS: 12500.00 },
      category: 'Racing',
      publisher: 'SpeedWorks',
      releaseDate: new Date('2024-11-30'),
      rating: 4.4,
      tags: ['racing', 'simulation', 'realistic', 'cars', 'championship'],
      screenshots: [
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'
      ],
      systemRequirements: {
        minimum: {
          os: 'Windows 10 64-bit',
          processor: 'Intel Core i5-9400F / AMD Ryzen 5 2600X',
          memory: '12 GB RAM',
          graphics: 'NVIDIA GTX 1660 / AMD RX 5500 XT',
          storage: '75 GB available space'
        },
        recommended: {
          os: 'Windows 11 64-bit',
          processor: 'Intel Core i7-11700K / AMD Ryzen 7 3700X',
          memory: '16 GB RAM',
          graphics: 'NVIDIA RTX 3080 / AMD RX 6700 XT',
          storage: '75 GB SSD space'
        }
      },
      downloadInfo: {
        sizeGB: 72.8,
        totalBlocks: 10,
        cdnRegions: ['us-east-1', 'sa-east-1', 'eu-west-1'],
        checksums: ['yzab567cdef890', 'ghij123klmn456']
      },
      featured: false,
      available: true,
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date('2024-11-25')
    },
    {
      id: 'game-004',
      title: 'Indie Puzzle Master',
      description: 'Colección de puzzles innovadores con arte pixel hermoso. Más de 500 niveles únicos que desafiarán tu mente.',
      shortDescription: 'Puzzles indie con arte pixel',
      price: { USD: 19.99, PEN: 75.00, MXN: 400.00, ARS: 5000.00 },
      category: 'Puzzle',
      publisher: 'PixelCraft',
      releaseDate: new Date('2024-08-15'),
      rating: 4.2,
      tags: ['puzzle', 'indie', 'pixel-art', 'casual', 'brain-teaser'],
      screenshots: [
        'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800',
        'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800'
      ],
      systemRequirements: {
        minimum: {
          os: 'Windows 10 32/64-bit',
          processor: 'Intel Core 2 Duo / AMD Phenom X2',
          memory: '4 GB RAM',
          graphics: 'DirectX 11 compatible',
          storage: '2 GB available space'
        },
        recommended: {
          os: 'Windows 10/11 64-bit',
          processor: 'Intel Core i3 / AMD Ryzen 3',
          memory: '8 GB RAM',
          graphics: 'DirectX 11 compatible',
          storage: '2 GB available space'
        }
      },
      downloadInfo: {
        sizeGB: 1.8,
        totalBlocks: 2,
        cdnRegions: ['us-east-1', 'sa-east-1'],
        checksums: ['opqr789stuv012', 'wxyz345abc678']
      },
      featured: false,
      available: true,
      createdAt: new Date('2024-07-20'),
      updatedAt: new Date('2024-08-10')
    },
    {
      id: 'game-005',
      title: 'Space Colony Builder',
      description: 'Construye y gestiona colonias espaciales en planetas alienígenas. Estrategia en tiempo real con elementos de supervivencia.',
      shortDescription: 'Constructor de colonias espaciales',
      price: { USD: 34.99, PEN: 130.00, MXN: 700.00, ARS: 8750.00 },
      category: 'Strategy',
      publisher: 'CosmicGames',
      releaseDate: new Date('2024-09-10'),
      rating: 4.7,
      tags: ['strategy', 'space', 'colony', 'building', 'survival'],
      screenshots: [
        'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
      ],
      systemRequirements: {
        minimum: {
          os: 'Windows 10 64-bit',
          processor: 'Intel Core i3-8100 / AMD Ryzen 3 2200G',
          memory: '8 GB RAM',
          graphics: 'NVIDIA GTX 1050 / AMD RX 560',
          storage: '25 GB available space'
        },
        recommended: {
          os: 'Windows 11 64-bit',
          processor: 'Intel Core i5-10400 / AMD Ryzen 5 3600',
          memory: '16 GB RAM',
          graphics: 'NVIDIA RTX 3060 / AMD RX 6600',
          storage: '25 GB SSD space'
        }
      },
      downloadInfo: {
        sizeGB: 23.6,
        totalBlocks: 4,
        cdnRegions: ['us-east-1', 'sa-east-1'],
        checksums: ['defg901hijk234', 'lmno567pqrs890']
      },
      featured: true,
      available: true,
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2024-09-05')
    }
  ];

  private categories: Category[] = [
    { id: 'action', name: 'Action', description: 'Juegos de acción y aventura', gameCount: 1 },
    { id: 'rpg', name: 'RPG', description: 'Juegos de rol', gameCount: 1 },
    { id: 'racing', name: 'Racing', description: 'Juegos de carreras', gameCount: 1 },
    { id: 'puzzle', name: 'Puzzle', description: 'Juegos de puzzles y lógica', gameCount: 1 },
    { id: 'strategy', name: 'Strategy', description: 'Juegos de estrategia', gameCount: 1 },
    { id: 'sports', name: 'Sports', description: 'Juegos deportivos', gameCount: 0 },
    { id: 'indie', name: 'Indie', description: 'Juegos independientes', gameCount: 0 }
  ];

  private publishers: Publisher[] = [
    { id: 'cyberstudio', name: 'CyberStudio', description: 'Desarrollador de juegos futuristas', website: 'https://cyberstudio.com', gameCount: 1 },
    { id: 'mythicgames', name: 'MythicGames', description: 'Especialistas en MMORPGs', website: 'https://mythicgames.com', gameCount: 1 },
    { id: 'speedworks', name: 'SpeedWorks', description: 'Simuladores de carreras premium', website: 'https://speedworks.com', gameCount: 1 },
    { id: 'pixelcraft', name: 'PixelCraft', description: 'Juegos indie con arte pixel', website: 'https://pixelcraft.com', gameCount: 1 },
    { id: 'cosmicgames', name: 'CosmicGames', description: 'Juegos espaciales y de estrategia', website: 'https://cosmicgames.com', gameCount: 1 }
  ];

  // MÉTODOS DE SERVICIO

  async findAll(page: number = 1, limit: number = 20): Promise<{ games: Game[], total: number, page: number, totalPages: number }> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const games = this.games.slice(startIndex, endIndex);
    const totalPages = Math.ceil(this.games.length / limit);

    return {
      games,
      total: this.games.length,
      page,
      totalPages
    };
  }

  async findOne(id: string): Promise<Game> {
    const game = this.games.find(g => g.id === id);
    if (!game) {
      throw new NotFoundException(`Juego con ID '${id}' no encontrado`);
    }
    return game;
  }

  async findFeatured(): Promise<Game[]> {
    return this.games.filter(game => game.featured && game.available);
  }

  async search(searchDto: SearchGamesDto): Promise<{ games: Game[], total: number, page: number, totalPages: number }> {
    let filteredGames = [...this.games];

    // Filtro por texto (título y descripción)
    if (searchDto.q) {
      const query = searchDto.q.toLowerCase();
      filteredGames = filteredGames.filter(game => 
        game.title.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query) ||
        game.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtro por categoría
    if (searchDto.category) {
  filteredGames = filteredGames.filter(game => 
    game.category.toLowerCase() === searchDto.category!.toLowerCase()
  );
}

    // Filtro por publisher
    if (searchDto.publisher) {
      filteredGames = filteredGames.filter(game => 
        game.publisher.toLowerCase().includes(searchDto.publisher!.toLowerCase())
      );
    }

    // Filtros de precio
    if (searchDto.priceMin || searchDto.priceMax) {
      const currency = searchDto.currency || 'USD';
      if (searchDto.priceMin) {
        filteredGames = filteredGames.filter(game => game.price[currency] >= searchDto.priceMin!);
      }
      if (searchDto.priceMax) {
        filteredGames = filteredGames.filter(game => game.price[currency] <= searchDto.priceMax!);
      }
    }

    // Filtro por tags
    if (searchDto.tags && searchDto.tags.length > 0) {
      filteredGames = filteredGames.filter(game =>
        searchDto.tags!.some(tag => game.tags.includes(tag.toLowerCase()))
      );
    }

    // Filtro por featured
    if (searchDto.featured !== undefined) {
      filteredGames = filteredGames.filter(game => game.featured === searchDto.featured);
    }

    // Filtro por disponibilidad
    if (searchDto.available !== undefined) {
      filteredGames = filteredGames.filter(game => game.available === searchDto.available);
    }

    // Ordenamiento
    if (searchDto.sortBy) {
      filteredGames.sort((a, b) => {
        let aValue, bValue;
        
        switch (searchDto.sortBy) {
          case 'price':
            const currency = searchDto.currency || 'USD';
            aValue = a.price[currency];
            bValue = b.price[currency];
            break;
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'releaseDate':
            aValue = a.releaseDate.getTime();
            bValue = b.releaseDate.getTime();
            break;
          default: // title
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
        }

        if (searchDto.sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
    }

    // Paginación
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const games = filteredGames.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredGames.length / limit);

    return {
      games,
      total: filteredGames.length,
      page,
      totalPages
    };
  }

  async getCategories(): Promise<Category[]> {
    return this.categories;
  }

  async getPublishers(): Promise<Publisher[]> {
    return this.publishers;
  }

  async create(createGameDto: CreateGameDto): Promise<Game> {
    // Verificar si ya existe un juego con el mismo título
    const existingGame = this.games.find(g => 
      g.title.toLowerCase() === createGameDto.title.toLowerCase()
    );
    
    if (existingGame) {
      throw new ConflictException('Ya existe un juego con este título');
    }

    const newGame: Game = {
      id: `game-${(this.games.length + 1).toString().padStart(3, '0')}`,
      title: createGameDto.title,
      description: createGameDto.description,
      shortDescription: createGameDto.shortDescription,
      price: createGameDto.price,
      category: createGameDto.category,
      publisher: createGameDto.publisher,
      releaseDate: new Date(),
      rating: createGameDto.rating,
      tags: createGameDto.tags,
      screenshots: createGameDto.screenshots,
      systemRequirements: {
        minimum: {
          os: 'Windows 10 64-bit',
          processor: 'Intel Core i3 / AMD Ryzen 3',
          memory: '8 GB RAM',
          graphics: 'DirectX 11 compatible',
          storage: `${createGameDto.sizeGB} GB available space`
        },
        recommended: {
          os: 'Windows 11 64-bit',
          processor: 'Intel Core i5 / AMD Ryzen 5',
          memory: '16 GB RAM',
          graphics: 'DirectX 12 compatible',
          storage: `${createGameDto.sizeGB} GB SSD space`
        }
      },
      downloadInfo: {
        sizeGB: createGameDto.sizeGB,
        totalBlocks: Math.ceil(createGameDto.sizeGB / 8), // 8GB por bloque
        cdnRegions: ['us-east-1', 'sa-east-1'],
        checksums: [`checksum-${Date.now()}`]
      },
      featured: createGameDto.featured || false,
      available: createGameDto.available !== undefined ? createGameDto.available : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.games.push(newGame);
    return newGame;
  }

  async update(id: string, updateGameDto: Partial<CreateGameDto>): Promise<Game> {
    const gameIndex = this.games.findIndex(g => g.id === id);
    
    if (gameIndex === -1) {
      throw new NotFoundException(`Juego con ID '${id}' no encontrado`);
    }

    const existingGame = this.games[gameIndex];
    const updatedGame: Game = {
      ...existingGame,
      ...updateGameDto,
      id: existingGame.id, // No permitir cambiar el ID
      updatedAt: new Date()
    };

    this.games[gameIndex] = updatedGame;
    return updatedGame;
  }

  async remove(id: string): Promise<void> {
    const gameIndex = this.games.findIndex(g => g.id === id);
    
    if (gameIndex === -1) {
      throw new NotFoundException(`Juego con ID '${id}' no encontrado`);
    }

    this.games.splice(gameIndex, 1);
  }

  // MÉTODOS AUXILIARES PARA ESTADÍSTICAS
  async getStats() {
    const totalGames = this.games.length;
    const featuredGames = this.games.filter(g => g.featured).length;
    const availableGames = this.games.filter(g => g.available).length;
    const avgRating = this.games.reduce((sum, game) => sum + game.rating, 0) / totalGames;
    const totalSizeGB = this.games.reduce((sum, game) => sum + game.downloadInfo.sizeGB, 0);

    const categoriesCount = this.games.reduce((acc, game) => {
      acc[game.category] = (acc[game.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const publishersCount = this.games.reduce((acc, game) => {
      acc[game.publisher] = (acc[game.publisher] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalGames,
      featuredGames,
      availableGames,
      avgRating: Math.round(avgRating * 100) / 100,
      totalSizeGB: Math.round(totalSizeGB * 100) / 100,
      categoriesCount,
      publishersCount,
      latestGames: this.games
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(g => ({ id: g.id, title: g.title, createdAt: g.createdAt }))
    };
  }
}