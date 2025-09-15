import { Module } from '@nestjs/common';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';

@Module({
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService], // Export service para uso en otros módulos
})
export class DownloadsModule {}