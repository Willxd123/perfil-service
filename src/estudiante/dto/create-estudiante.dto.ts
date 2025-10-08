import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEstudianteDto {
  @ApiProperty({
    description: 'Número de registro del estudiante',
    example: '2021-001',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  registro: string;

  @ApiProperty({
    description: 'Nombre completo del estudiante',
    example: 'Juan Pérez García',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Email del estudiante',
    example: 'juan.perez@example.com',
    type: String,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del estudiante',
    example: '+591 70123456',
    type: String,
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario relacionado',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({
    description: 'ID del plan de estudio',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  plan_estudio_id: number;
}