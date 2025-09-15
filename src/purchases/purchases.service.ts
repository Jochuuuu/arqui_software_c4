// src/purchases/purchases.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Purchase, Entitlement, PurchaseStatus } from './interfaces/purchase.interface';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { GamesService } from '../games/games.service';

@Injectable()
export class PurchasesService {
    // Mock databases en memoria
    private purchases: Map<string, Purchase> = new Map();
    private entitlements: Map<string, Entitlement> = new Map();

    constructor(private readonly gamesService: GamesService) {
        this.seedMockData();
    }

    // Crear compra de juego
    async createPurchase(userId: string, gameId: string, createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
        // Verificar que el juego existe
        const game = await this.gamesService.findOne(gameId);
        if (!game) {
            throw new NotFoundException(`Game with ID ${gameId} not found`);
        }

        if (!game.available) {
            throw new BadRequestException(`Game ${game.title} is not available for purchase`);
        }

        // Verificar si ya lo compró
        const existingEntitlement = this.findEntitlementByUserAndGame(userId, gameId);
        if (existingEntitlement) {
            throw new ConflictException(`User already owns this game`);
        }

        // Determinar moneda y precio
        const currency = createPurchaseDto.currency || this.getCurrencyByCountry(createPurchaseDto.country);
        const amount = game.price[currency] || game.price.USD;

        // Crear purchase
        const purchase: Purchase = {
            id: uuidv4(),
            userId,
            gameId,
            amount,
            currency,
            paymentMethod: createPurchaseDto.paymentMethod,
            status: PurchaseStatus.PENDING,
            country: createPurchaseDto.country,
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            purchaseDate: new Date(),
        };

        this.purchases.set(purchase.id, purchase);

        // Simular procesamiento de pago (mock)
        setTimeout(() => {
            this.processPurchase(purchase.id);
        }, 2000); // 2 segundos de delay

        return purchase;
    }

    // Procesar pago (mock)
    private async processPurchase(purchaseId: string): Promise<void> {
        const purchase = this.purchases.get(purchaseId);
        if (!purchase) return;

        // 95% de éxito en pagos (para simular realismo)
        const paymentSuccess = Math.random() > 0.05;

        if (paymentSuccess) {
            purchase.status = PurchaseStatus.COMPLETED;
            purchase.completedAt = new Date();

            // Crear entitlement
            this.createEntitlement(purchase.userId, purchase.gameId, purchase.id);
        } else {
            purchase.status = PurchaseStatus.FAILED;
        }

        this.purchases.set(purchaseId, purchase);
    }

    // Crear entitlement (derecho de descarga)
    private createEntitlement(userId: string, gameId: string, purchaseId: string): void {
        const entitlement: Entitlement = {
            id: uuidv4(),
            userId,
            gameId,
            purchaseId,
            grantedAt: new Date(),
            active: true,
            downloadCount: 0,
            maxDownloads: 5, // Máximo 5 descargas
        };

        this.entitlements.set(entitlement.id, entitlement);
    }

    // Obtener historial de compras del usuario
    async getUserPurchases(userId: string): Promise<Purchase[]> {
        return Array.from(this.purchases.values())
            .filter(purchase => purchase.userId === userId)
            .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime());
    }

    // Obtener una compra específica
    async getPurchase(userId: string, purchaseId: string): Promise<Purchase> {
        const purchase = this.purchases.get(purchaseId);

        if (!purchase) {
            throw new NotFoundException(`Purchase with ID ${purchaseId} not found`);
        }

        if (purchase.userId !== userId) {
            throw new NotFoundException(`Purchase not found for this user`);
        }

        return purchase;
    }

    // Obtener entitlements del usuario
    async getUserEntitlements(userId: string): Promise<Entitlement[]> {
        return Array.from(this.entitlements.values())
            .filter(entitlement => entitlement.userId === userId && entitlement.active)
            .sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime());
    }

    // Verificar entitlement para un juego específico
    async checkGameEntitlement(userId: string, gameId: string): Promise<Entitlement | null> {
        return this.findEntitlementByUserAndGame(userId, gameId);
    }

    // Verificar si usuario puede descargar un juego
    async canDownloadGame(userId: string, gameId: string): Promise<boolean> {
        const entitlement = this.findEntitlementByUserAndGame(userId, gameId);
        return !!(entitlement && entitlement.active && entitlement.downloadCount < entitlement.maxDownloads);
    }

    // Incrementar contador de descargas
    async incrementDownloadCount(userId: string, gameId: string): Promise<void> {
        const entitlement = this.findEntitlementByUserAndGame(userId, gameId);
        if (entitlement) {
            entitlement.downloadCount++;
            this.entitlements.set(entitlement.id, entitlement);
        }
    }

    // Helpers privados
    private findEntitlementByUserAndGame(userId: string, gameId: string): Entitlement | null {
        return Array.from(this.entitlements.values())
            .find(entitlement =>
                entitlement.userId === userId &&
                entitlement.gameId === gameId &&
                entitlement.active
            ) || null;
    }

    private getCurrencyByCountry(country: string): string {
        const currencyMap = {
            'PE': 'PEN',
            'AR': 'ARS',
            'MX': 'MXN',
            'US': 'USD',
            'BR': 'USD', // Brazil usa USD en gaming
        };
        return currencyMap[country] || 'USD';
    }

    // Seed data para testing
    private seedMockData(): void {
        // Crear compras y entitlements de prueba usando tus juegos existentes

        // Usuario "1" compró Cyber Warriors 2077 hace 5 días
        const purchase1: Purchase = {
            id: 'purchase-001',
            userId: '1',
            gameId: 'game-001', // Cyber Warriors 2077
            amount: 220.00,
            currency: 'PEN',
            paymentMethod: 'credit_card',
            status: PurchaseStatus.COMPLETED,
            country: 'PE',
            transactionId: 'txn_mock_001',
            purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        };

        // Usuario "2" compró Medieval Legends hace 2 días  
        const purchase2: Purchase = {
            id: 'purchase-002',
            userId: '2',
            gameId: 'game-002', // Medieval Legends Online
            amount: 39.99,
            currency: 'USD',
            paymentMethod: 'paypal',
            status: PurchaseStatus.COMPLETED,
            country: 'US',
            transactionId: 'txn_mock_002',
            purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        };

        // Agregar purchases al Map
        this.purchases.set(purchase1.id, purchase1);
        this.purchases.set(purchase2.id, purchase2);

        // Crear entitlements correspondientes
        const entitlement1: Entitlement = {
            id: 'entitlement-001',
            userId: '1',
            gameId: 'game-001',
            purchaseId: 'purchase-001',
            grantedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            active: true,
            downloadCount: 2, // Ya descargó 2 veces
            maxDownloads: 5,
        };

        const entitlement2: Entitlement = {
            id: 'entitlement-002',
            userId: '2',
            gameId: 'game-002',
            purchaseId: 'purchase-002',
            grantedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            active: true,
            downloadCount: 0, // No ha descargado aún
            maxDownloads: 5,
        };

        // Agregar entitlements al Map
        this.entitlements.set(entitlement1.id, entitlement1);
        this.entitlements.set(entitlement2.id, entitlement2);

        console.log('PurchasesService initialized with mock data:');
        console.log('- 2 purchases created');
        console.log('- 2 entitlements granted');
        console.log('- User "1" owns Cyber Warriors 2077');
        console.log('- User "2" owns Medieval Legends Online');
    }
}