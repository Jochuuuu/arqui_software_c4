import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Para usar JwtAuthGuard
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService], // Para usar en otros módulos como Downloads
})
export class GamesModule {}