import { IsNotEmpty, IsString, IsInt, IsPositive, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateHorarioDto {
  @ApiProperty({
    description: 'Día de la semana',
    example: 'Lunes',
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  })
  @IsNotEmpty({ message: 'El día es obligatorio' })
  @IsString({ message: 'El día debe ser texto' })
  dia: string;

  @ApiProperty({
    description: 'Hora de inicio (formato HH:MM:SS o HH:MM)',
    example: '08:00:00',
  })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  @IsString({ message: 'La hora de inicio debe ser texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'La hora de inicio debe tener formato HH:MM o HH:MM:SS',
  })
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin (formato HH:MM:SS o HH:MM)',
    example: '10:00:00',
  })
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  @IsString({ message: 'La hora de fin debe ser texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'La hora de fin debe tener formato HH:MM o HH:MM:SS',
  })
  horaFin: string;

  @ApiProperty({
    description: 'ID del grupo',
    example: 1,
  })
  @IsNotEmpty({ message: 'El grupo es obligatorio' })
  @Type(() => Number)
  @IsInt({ message: 'El grupo debe ser un número entero' })
  @IsPositive({ message: 'El grupo debe ser un número positivo' })
  grupoId: number;

  @ApiProperty({
    description: 'ID del aula',
    example: 5,
  })
  @IsNotEmpty({ message: 'El aula es obligatoria' })
  @Type(() => Number)
  @IsInt({ message: 'El aula debe ser un número entero' })
  @IsPositive({ message: 'El aula debe ser un número positivo' })
  aulaId: number;

  @ApiProperty({
    description: 'ID del módulo',
    example: 2,
  })
  @IsNotEmpty({ message: 'El módulo es obligatorio' })
  @Type(() => Number)
  @IsInt({ message: 'El módulo debe ser un número entero' })
  @IsPositive({ message: 'El módulo debe ser un número positivo' })
  moduloId: number;
}