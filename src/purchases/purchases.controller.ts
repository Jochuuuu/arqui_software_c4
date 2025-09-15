// src/purchases/purchases.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard  } from '../auth/jwt.guard';
import { PurchasesService } from './purchases.service';
import { GamesService } from '../games/games.service';
import { CreatePurchaseDto, PurchaseResponseDto, EntitlementResponseDto } from './dto';

@ApiTags('Purchases & Entitlements')
@Controller('purchases')
@UseGuards(JwtAuthGuard )
@ApiBearerAuth()
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
    private readonly gamesService: GamesService,
  ) {}

  @Post(':gameId')
  @ApiOperation({ 
    summary: 'Purchase a game',
    description: 'Purchase a game and automatically grant download entitlement'
  })
  @ApiParam({ name: 'gameId', description: 'Game ID to purchase' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Game purchased successfully',
    type: PurchaseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Game not available or already owned' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async purchaseGame(
    @Param('gameId') gameId: string,
    @Body() createPurchaseDto: CreatePurchaseDto,
    @Request() req: any,
  ): Promise<PurchaseResponseDto> {
    const purchase = await this.purchasesService.createPurchase(
      req.user.userId,
      gameId,
      createPurchaseDto,
    );

    // Obtener info del juego para la respuesta
    const game = await this.gamesService.findOne(gameId);

    return {
      id: purchase.id,
      gameId: purchase.gameId,
      gameTitle: game.title,
      amount: purchase.amount,
      currency: purchase.currency,
      paymentMethod: purchase.paymentMethod,
      status: purchase.status,
      transactionId: purchase.transactionId,
      purchaseDate: purchase.purchaseDate,
      entitlementGranted: purchase.status === 'completed',
    };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get user purchase history',
    description: 'Retrieve all purchases made by the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase history retrieved successfully',
    type: [PurchaseResponseDto],
  })
  async getUserPurchases(@Request() req: any): Promise<PurchaseResponseDto[]> {
    const purchases = await this.purchasesService.getUserPurchases(req.user.userId);
    
    // Enriquecer con info de juegos
    const enrichedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        const game = await this.gamesService.findOne(purchase.gameId);
        return {
          id: purchase.id,
          gameId: purchase.gameId,
          gameTitle: game?.title || 'Unknown Game',
          amount: purchase.amount,
          currency: purchase.currency,
          paymentMethod: purchase.paymentMethod,
          status: purchase.status,
          transactionId: purchase.transactionId,
          purchaseDate: purchase.purchaseDate,
          entitlementGranted: purchase.status === 'completed',
        };
      }),
    );

    return enrichedPurchases;
  }

  @Get(':purchaseId')
  @ApiOperation({ 
    summary: 'Get specific purchase details',
    description: 'Retrieve details of a specific purchase'
  })
  @ApiParam({ name: 'purchaseId', description: 'Purchase ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase details retrieved successfully',
    type: PurchaseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async getPurchase(
    @Param('purchaseId') purchaseId: string,
    @Request() req: any,
  ): Promise<PurchaseResponseDto> {
    const purchase = await this.purchasesService.getPurchase(req.user.userId, purchaseId);
    const game = await this.gamesService.findOne(purchase.gameId);

    return {
      id: purchase.id,
      gameId: purchase.gameId,
      gameTitle: game?.title || 'Unknown Game',
      amount: purchase.amount,
      currency: purchase.currency,
      paymentMethod: purchase.paymentMethod,
      status: purchase.status,
      transactionId: purchase.transactionId,
      purchaseDate: purchase.purchaseDate,
      entitlementGranted: purchase.status === 'completed',
    };
  }
}

// Controlador separado para entitlements
@ApiTags('Entitlements')
@Controller('entitlements')
@UseGuards(JwtAuthGuard )
@ApiBearerAuth()
export class EntitlementsController {
  constructor(
    private readonly purchasesService: PurchasesService,
    private readonly gamesService: GamesService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get user entitlements',
    description: 'Retrieve all games the user can download'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Entitlements retrieved successfully',
    type: [EntitlementResponseDto],
  })
  async getUserEntitlements(@Request() req: any): Promise<EntitlementResponseDto[]> {
    const entitlements = await this.purchasesService.getUserEntitlements(req.user.userId);
    
    // Enriquecer con info de juegos
    const enrichedEntitlements = await Promise.all(
      entitlements.map(async (entitlement) => {
        const game = await this.gamesService.findOne(entitlement.gameId);
        return {
          gameId: entitlement.gameId,
          gameTitle: game?.title || 'Unknown Game',
          grantedAt: entitlement.grantedAt,
          active: entitlement.active,
          downloadCount: entitlement.downloadCount,
          maxDownloads: entitlement.maxDownloads,
          canDownload: entitlement.downloadCount < entitlement.maxDownloads,
        };
      }),
    );

    return enrichedEntitlements;
  }

  @Get(':gameId')
  @ApiOperation({ 
    summary: 'Check game entitlement',
    description: 'Check if user can download a specific game'
  })
  @ApiParam({ name: 'gameId', description: 'Game ID to check' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Entitlement status retrieved successfully',
    type: EntitlementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Entitlement not found' })
  async checkGameEntitlement(
    @Param('gameId') gameId: string,
    @Request() req: any,
  ): Promise<EntitlementResponseDto> {
    const entitlement = await this.purchasesService.checkGameEntitlement(req.user.userId, gameId);
    
    if (!entitlement) {
      throw new NotFoundException(`No entitlement found for game ${gameId}`);
    }

    const game = await this.gamesService.findOne(gameId);

    return {
      gameId: entitlement.gameId,
      gameTitle: game?.title || 'Unknown Game',
      grantedAt: entitlement.grantedAt,
      active: entitlement.active,
      downloadCount: entitlement.downloadCount,
      maxDownloads: entitlement.maxDownloads,
      canDownload: entitlement.downloadCount < entitlement.maxDownloads,
    };
  }
}