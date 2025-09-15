import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsArray, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class PriceDto {
  @ApiProperty({ example: 59.99, description: 'Precio en USD' })
  @IsNumber()
  @Min(0)
  USD: number;

  @ApiProperty({ example: 220.00, description: 'Precio en PEN' })
  @IsNumber()
  @Min(0)
  PEN: number;

  @ApiProperty({ example: 1200.00, description: 'Precio en MXN' })
  @IsNumber()
  @Min(0)
  MXN: number;

  @ApiProperty({ example: 15000.00, description: 'Precio en ARS' })
  @IsNumber()
  @Min(0)
  ARS: number;
}

export class CreateGameDto {
  @ApiProperty({
    example: 'Cyber Warriors 2077',
    description: 'Título del juego'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Un juego de acción futurista con elementos RPG...',
    description: 'Descripción completa del juego'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Acción futurista con RPG',
    description: 'Descripción corta para listados'
  })
  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @ApiProperty({ type: PriceDto, description: 'Precios en múltiples monedas' })
  @Type(() => PriceDto)
  price: PriceDto;

  @ApiProperty({
    example: 'Action',
    description: 'Categoría del juego'
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: 'CyberStudio',
    description: 'Publisher/Desarrollador'
  })
  @IsString()
  @IsNotEmpty()
  publisher: string;

  @ApiProperty({
    example: 4.5,
    description: 'Rating del juego (1-5 estrellas)',
    minimum: 1,
    maximum: 5
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: ['cyberpunk', 'action', 'rpg', 'multiplayer'],
    description: 'Tags del juego'
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    example: ['screenshot1.jpg', 'screenshot2.jpg'],
    description: 'URLs de screenshots'
  })
  @IsArray()
  @IsString({ each: true })
  screenshots: string[];

  @ApiProperty({
    example: 85.4,
    description: 'Tamaño en GB'
  })
  @IsNumber()
  @Min(0.1)
  sizeGB: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Si el juego es destacado'
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Si el juego está disponible'
  })
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}