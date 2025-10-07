import { IsNotEmpty, IsString, IsInt, IsPositive, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAulaDto {
  @ApiProperty({
    description: 'Número del aula',
    example: '101',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El número es obligatorio' })
  @IsString({ message: 'El número debe ser texto' })
  @MaxLength(255, { message: 'El número no puede superar los 255 caracteres' })
  numero: string;

  @ApiProperty({
    description: 'ID del módulo al que pertenece el aula',
    example: 1,
  })
  @IsNotEmpty({ message: 'El módulo es obligatorio' })
  @Type(() => Number)
  @IsInt({ message: 'El módulo debe ser un número entero' })
  @IsPositive({ message: 'El módulo debe ser un número positivo' })
  moduloId: number;
}