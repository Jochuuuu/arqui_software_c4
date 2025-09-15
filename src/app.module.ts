import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { PurchasesController } from './purchases/purchases.controller';
import { PurchasesModule } from './purchases/purchases.module';
import { DownloadsModule } from './downloads/downloads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    GamesModule,
    PurchasesModule,
    DownloadsModule, // ← AGREGAR ESTA LÍNEA
  ],
  controllers: [AppController, PurchasesController],
  providers: [AppService],
})
export class AppModule {}