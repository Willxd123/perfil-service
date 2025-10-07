import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuloDto {
  @ApiProperty({
    description: 'Número del módulo',
    example: 'A',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El número es obligatorio' })
  @IsString({ message: 'El número debe ser texto' })
  @MaxLength(255, { message: 'El número no puede superar los 255 caracteres' })
  numero: string;
}