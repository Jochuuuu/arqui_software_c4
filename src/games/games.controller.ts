import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { GamesService } from './games.service';
import { SearchGamesDto } from './dto/search-games.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('🎮 Games Catalog')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar Juegos',
    description: 'Obtiene el catálogo completo de juegos con paginación'
  })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, example: 20, description: 'Juegos por página (max: 50)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Catálogo obtenido exitosamente',
    schema: {
      example: {
        games: [
          {
            id: 'game-001',
            title: 'Cyber Warriors 2077',
            shortDescription: 'Acción futurista con elementos RPG',
            price: { USD: 59.99, PEN: 220.00, MXN: 1200.00, ARS: 15000.00 },
            category: 'Action',
            publisher: 'CyberStudio',
            rating: 4.8,
            featured: true,
            screenshots: ['screenshot1.jpg', 'screenshot2.jpg']
          }
        ],
        total: 5,
        page: 1,
        totalPages: 1
      }
    }
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number
  ) {
    // Límite máximo de 50 juegos por página
    const safeLimit = Math.min(limit, 50);
    return this.gamesService.findAll(page, safeLimit);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar Juegos',
    description: 'Busca juegos con filtros avanzados: categoría, precio, tags, etc.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Búsqueda realizada exitosamente',
    schema: {
      example: {
        games: [
          {
            id: 'game-001',
            title: 'Cyber Warriors 2077',
            shortDescription: 'Acción futurista con elementos RPG',
            price: { USD: 59.99, PEN: 220.00 },
            category: 'Action',
            rating: 4.8
          }
        ],
        total: 1,
        page: 1,
        totalPages: 1
      }
    }
  })
  async search(@Query() searchDto: SearchGamesDto) {
    return this.gamesService.search(searchDto);
  }

  @Get('featured')
  @ApiOperation({
    summary: 'Juegos Destacados',
    description: 'Obtiene solo los juegos marcados como destacados'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Juegos destacados obtenidos exitosamente',
    schema: {
      example: [
        {
          id: 'game-001',
          title: 'Cyber Warriors 2077',
          shortDescription: 'Acción futurista con elementos RPG',
          price: { USD: 59.99, PEN: 220.00 },
          category: 'Action',
          rating: 4.8,
          featured: true
        }
      ]
    }
  })
  async findFeatured() {
    return this.gamesService.findFeatured();
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Listar Categorías',
    description: 'Obtiene todas las categorías disponibles con conteo de juegos'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categorías obtenidas exitosamente',
    schema: {
      example: [
        { id: 'action', name: 'Action', description: 'Juegos de acción y aventura', gameCount: 1 },
        { id: 'rpg', name: 'RPG', description: 'Juegos de rol', gameCount: 1 }
      ]
    }
  })
  async getCategories() {
    return this.gamesService.getCategories();
  }

  @Get('publishers')
  @ApiOperation({
    summary: 'Listar Publishers',
    description: 'Obtiene todos los desarrolladores/publishers con información'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Publishers obtenidos exitosamente',
    schema: {
      example: [
        {
          id: 'cyberstudio',
          name: 'CyberStudio',
          description: 'Desarrollador de juegos futuristas',
          website: 'https://cyberstudio.com',
          gameCount: 1
        }
      ]
    }
  })
  async getPublishers() {
    return this.gamesService.getPublishers();
  }

  @Get('stats')
  @ApiOperation({
    summary: '📊 Estadísticas del Catálogo',
    description: 'Obtiene estadísticas generales del catálogo de juegos'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        totalGames: 5,
        featuredGames: 3,
        availableGames: 5,
        avgRating: 4.54,
        totalSizeGB: 284.8,
        categoriesCount: { Action: 1, RPG: 1, Racing: 1 },
        publishersCount: { CyberStudio: 1, MythicGames: 1 },
        latestGames: [
          { id: 'game-001', title: 'Cyber Warriors 2077', createdAt: '2024-11-01T00:00:00.000Z' }
        ]
      }
    }
  })
  async getStats() {
    return this.gamesService.getStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener Juego por ID',
    description: 'Obtiene todos los detalles de un juego específico incluyendo requisitos del sistema'
  })
  @ApiParam({ name: 'id', example: 'game-001', description: 'ID único del juego' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Juego encontrado exitosamente',
    schema: {
      example: {
        id: 'game-001',
        title: 'Cyber Warriors 2077',
        description: 'Un épico juego de acción...',
        shortDescription: 'Acción futurista con elementos RPG',
        price: { USD: 59.99, PEN: 220.00, MXN: 1200.00, ARS: 15000.00 },
        category: 'Action',
        publisher: 'CyberStudio',
        releaseDate: '2024-12-15T00:00:00.000Z',
        rating: 4.8,
        tags: ['cyberpunk', 'action', 'rpg', 'multiplayer'],
        screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
        systemRequirements: {
          minimum: {
            os: 'Windows 10 64-bit',
            processor: 'Intel Core i5-8400',
            memory: '8 GB RAM',
            graphics: 'NVIDIA GTX 1060 6GB',
            storage: '85 GB available space'
          }
        },
        downloadInfo: {
          sizeGB: 85.4,
          totalBlocks: 12,
          cdnRegions: ['us-east-1', 'sa-east-1']
        },
        featured: true,
        available: true
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Juego no encontrado'
  })
  async findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '➕ Crear Nuevo Juego',
    description: 'Permite a publishers agregar nuevos juegos al catálogo'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Juego creado exitosamente',
    schema: {
      example: {
        id: 'game-006',
        title: 'Mi Nuevo Juego',
        description: 'Descripción del juego...',
        price: { USD: 29.99, PEN: 110.00 },
        category: 'Action',
        publisher: 'Mi Estudio',
        featured: false,
        available: true,
        createdAt: '2025-09-14T15:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un juego con este título'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT requerido'
  })
  async create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '✏️ Actualizar Juego',
    description: 'Actualiza información de un juego existente'
  })
  @ApiParam({ name: 'id', example: 'game-001', description: 'ID del juego a actualizar' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Juego actualizado exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Juego no encontrado'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT requerido'
  })
  async update(@Param('id') id: string, @Body() updateGameDto: Partial<CreateGameDto>) {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '🗑️ Eliminar Juego',
    description: 'Elimina un juego del catálogo'
  })
  @ApiParam({ name: 'id', example: 'game-001', description: 'ID del juego a eliminar' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Juego eliminado exitosamente',
    schema: {
      example: {
        message: 'Juego eliminado exitosamente',
        deletedGameId: 'game-001'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Juego no encontrado'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT requerido'
  })
  async remove(@Param('id') id: string) {
    await this.gamesService.remove(id);
    return {
      message: 'Juego eliminado exitosamente',
      deletedGameId: id
    };
  }
}