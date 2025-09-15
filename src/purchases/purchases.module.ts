// src/purchases/purchases.module.ts
import { Module } from '@nestjs/common';
import { PurchasesController, EntitlementsController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [GamesModule], // Importamos GamesModule para usar GamesService
  controllers: [PurchasesController, EntitlementsController],
  providers: [PurchasesService],
  exports: [PurchasesService], // Exportamos para que DownloadsModule lo pueda usar
})
export class PurchasesModule {}