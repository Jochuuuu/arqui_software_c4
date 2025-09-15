import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchGamesDto {
  @ApiPropertyOptional({
    example: 'Cyber Warriors',
    description: 'Buscar en título y descripción del juego'
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    example: 'Action',
    description: 'Filtrar por categoría específica'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'CyberStudio',
    description: 'Filtrar por publisher/desarrollador'
  })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Precio mínimo en la moneda especificada'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Precio máximo en la moneda especificada'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional({
    example: 'USD',
    enum: ['USD', 'PEN', 'MXN', 'ARS', 'EUR'],
    description: 'Moneda para filtros de precio'
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: ['multiplayer', 'indie'],
    description: 'Tags para filtrar juegos'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  tags?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Solo juegos destacados'
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Solo juegos disponibles para descarga'
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  available?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página (default: 1)'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Juegos por página (max: 50)'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({
    example: 'title',
    enum: ['title', 'price', 'rating', 'releaseDate'],
    description: 'Campo para ordenar resultados'
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'asc',
    enum: ['asc', 'desc'],
    description: 'Orden ascendente o descendente'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}