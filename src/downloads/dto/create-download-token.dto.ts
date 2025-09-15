import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateDownloadTokenDto {
  @ApiProperty({
    description: 'País del usuario para CDN optimization',
    example: 'PE',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'Región preferida para descarga',
    example: 'south-america',
    enum: ['north-america', 'south-america', 'europe', 'asia'],
    required: false,
  })
  @IsOptional()
  @IsIn(['north-america', 'south-america', 'europe', 'asia'])
  preferredRegion?: string;
}