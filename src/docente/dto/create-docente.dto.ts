import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateDocenteDto {
  @IsNotEmpty()
  @IsString()
  registro: string;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
