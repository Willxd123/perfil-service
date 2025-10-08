import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGrupoEstudianteDto {
  @ApiPropertyOptional({
    description: 'Nota del estudiante en el grupo',
    example: 85,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  nota?: number;

  @ApiProperty({
    description: 'Créditos del grupo',
    example: 4,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  creditos: number;

  @ApiProperty({
    description: 'ID del estudiante',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  estudiante_id: number;

  @ApiProperty({
    description: 'ID del grupo',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  grupo_id: number;
}