import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyBlockDto {
  @ApiProperty({
    description: 'Checksum calculado del bloque descargado',
    example: 'sha256:a1b2c3d4e5f6...',
  })
  @IsNotEmpty()
  @IsString()
  checksum: string;
}