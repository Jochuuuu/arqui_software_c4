import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard  } from '../auth/jwt.guard';
import { DownloadsService } from './downloads.service';
import { CreateDownloadTokenDto, VerifyBlockDto } from './dto';
import {
  DownloadToken,
  GameBlock,
  DownloadStatus,
  CDNServer,
  BlockVerificationResult,
} from './interfaces';

@ApiTags('📥 Downloads')
@Controller('downloads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post('token/:gameId')
  @ApiOperation({
    summary: 'Generar token temporal para descarga',
    description: `
      Genera un token temporal que permite descargar un juego específico.
      
      **Prerrequisitos:**
      - Usuario debe tener entitlement del juego
      - Token válido por 4 horas
      - Máximo 5 descargas por token
      
      **Funcionalidades:**
      - Selección automática de CDN óptimo por región
      - URLs de descarga redundantes para alta disponibilidad
    `,
  })
  @ApiParam({
    name: 'gameId',
    description: 'ID del juego a descargar',
    example: 'game-001',
  })
  @ApiResponse({
    status: 201,
    description: 'Token generado exitosamente',
    schema: {
      example: {
        token: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
        gameId: 'game-001',
        expiresAt: '2024-01-15T18:30:00Z',
        downloadUrls: [
          'https://cdn-sa2.gameplatform.com',
          'https://cdn-sa1.gameplatform.com'
        ],
        region: 'south-america',
        maxDownloads: 5,
        usedDownloads: 0,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Usuario no posee el juego',
  })
  async generateToken(
    @Param('gameId') gameId: string,
    @Request() req: any,
    @Body() dto: CreateDownloadTokenDto,
  ): Promise<DownloadToken> {
    return this.downloadsService.generateDownloadToken(gameId, req.user.id, dto);
  }

  @Get('status/:gameId')
  @ApiOperation({
    summary: 'Obtener estado de descarga',
    description: `
      Retorna el estado actual de descarga de un juego específico.
      
      **Información incluida:**
      - Progreso de descarga (% completado)
      - Velocidad actual de descarga
      - Tiempo estimado restante
      - Bloques fallidos que requieren reintento
    `,
  })
  @ApiParam({
    name: 'gameId',
    description: 'ID del juego',
    example: 'game-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de descarga',
    schema: {
      example: {
        gameId: 'game-001',
        gameTitle: 'Cyber Warriors 2077',
        totalBlocks: 45,
        downloadedBlocks: 23,
        totalSize: 4500000000,
        downloadedSize: 2300000000,
        progress: 51.1,
        status: 'downloading',
        downloadSpeed: 25000000,
        estimatedTimeRemaining: 1440,
        lastActivity: '2024-01-15T14:30:00Z',
        failedBlocks: [],
      },
    },
  })
  async getDownloadStatus(
    @Param('gameId') gameId: string,
    @Request() req: any,
  ): Promise<DownloadStatus> {
    return this.downloadsService.getDownloadStatus(gameId, req.user.id);
  }

  @Get('blocks/:gameId')
  @ApiOperation({
    summary: 'Listar bloques del juego',
    description: `
      Retorna la lista completa de bloques que componen un juego.
      
      **Información por bloque:**
      - Tamaño y checksum para verificación
      - URL de descarga directa
      - Tipo de compresión aplicada
      - Si es bloque requerido o opcional
    `,
  })
  @ApiParam({
    name: 'gameId',
    description: 'ID del juego',
    example: 'game-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de bloques del juego',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
          id: 'game-001-block-0',
          gameId: 'game-001',
          blockNumber: 0,
          size: 104857600,
          checksum: 'sha256:a1b2c3d4e5f6...',
          downloadUrl: 'https://cdn.gameplatform.com/blocks/game-001/block-0.dat',
          isRequired: true,
          compressionType: 'gzip',
        },
      },
    },
  })
  async getGameBlocks(
    @Param('gameId') gameId: string,
    @Request() req: any,
  ): Promise<GameBlock[]> {
    return this.downloadsService.getGameBlocks(gameId, req.user.id);
  }

  @Post('verify/:blockId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar integridad de bloque',
    description: `
      Verifica que un bloque descargado tenga la integridad correcta.
      
      **Proceso:**
      1. Cliente calcula checksum del bloque descargado
      2. Envía checksum al servidor para verificación
      3. Servidor confirma si coincide con checksum esperado
      4. Si falla, proporciona nueva URL de descarga
    `,
  })
  @ApiParam({
    name: 'blockId',
    description: 'ID del bloque a verificar',
    example: 'game-001-block-0',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de verificación',
    schema: {
      example: {
        blockId: 'game-001-block-0',
        isValid: true,
        actualChecksum: 'sha256:a1b2c3d4e5f6...',
        expectedChecksum: 'sha256:a1b2c3d4e5f6...',
        retryRequired: false,
      },
    },
  })
  async verifyBlock(
    @Param('blockId') blockId: string,
    @Request() req: any,
    @Body() dto: VerifyBlockDto,
  ): Promise<BlockVerificationResult> {
    return this.downloadsService.verifyBlock(blockId, req.user.id, dto);
  }

  @Get('servers')
  @ApiOperation({
    summary: 'Obtener servidores CDN disponibles',
    description: `
      Lista los servidores CDN disponibles con información de rendimiento.
      
      **Información incluida:**
      - Latencia promedio por región
      - Carga actual del servidor
      - Ancho de banda disponible
      - Prioridad de selección automática
    `,
  })
  @ApiQuery({
    name: 'region',
    required: false,
    description: 'Filtrar por región específica',
    example: 'south-america',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de servidores CDN',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
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
      },
    },
  })
  async getCDNServers(@Query('region') region?: string): Promise<CDNServer[]> {
    return this.downloadsService.getCDNServers(region);
  }

  @Post('start/:gameId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar descarga de juego',
    description: `
      Inicia el proceso de descarga de un juego.
      
      **Prerrequisitos:**
      - Token de descarga válido generado previamente
      - Juego no debe estar ya completamente descargado
    `,
  })
  @ApiParam({
    name: 'gameId',
    description: 'ID del juego a descargar',
    example: 'game-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Descarga iniciada',
    schema: {
      example: {
        message: 'Download started successfully',
        status: {
          gameId: 'game-001',
          status: 'downloading',
          progress: 0,
          downloadSpeed: 35000000,
        },
      },
    },
  })
  async startDownload(
    @Param('gameId') gameId: string,
    @Request() req: any,
  ) {
    return this.downloadsService.startDownload(gameId, req.user.id);
  }

  @Post('pause/:gameId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pausar descarga de juego',
    description: 'Pausa una descarga en progreso. Puede ser reanudada posteriormente.',
  })
  @ApiParam({
    name: 'gameId',
    description: 'ID del juego',
    example: 'game-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Descarga pausada',
    schema: {
      example: {
        message: 'Download paused successfully',
      },
    },
  })
  async pauseDownload(
    @Param('gameId') gameId: string,
    @Request() req: any,
  ) {
    return this.downloadsService.pauseDownload(gameId, req.user.id);
  }
}