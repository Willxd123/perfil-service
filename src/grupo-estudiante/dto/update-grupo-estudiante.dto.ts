import { PartialType } from '@nestjs/mapped-types';
import { CreateGrupoEstudianteDto } from './create-grupo-estudiante.dto';

export class UpdateGrupoEstudianteDto extends PartialType(CreateGrupoEstudianteDto) {}
