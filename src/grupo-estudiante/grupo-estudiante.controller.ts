import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { GrupoEstudianteService } from './grupo-estudiante.service';
import { CreateGrupoEstudianteDto } from './dto/create-grupo-estudiante.dto';

@ApiTags('Grupos-Estudiantes')
@Controller('grupos-estudiantes')
export class GrupoEstudianteController {
  constructor(private readonly grupoEstudianteService: GrupoEstudianteService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los grupos-estudiantes' })
  @ApiResponse({ status: 200, description: 'Lista de grupos-estudiantes' })
  findAll() {
    return this.grupoEstudianteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener grupo-estudiante por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Grupo-estudiante encontrado' })
  @ApiResponse({ status: 404, description: 'Grupo-estudiante no encontrado' })
  findOne(@Param('id') id: number) {
    return this.grupoEstudianteService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear grupo-estudiante' })
  @ApiBody({ type: CreateGrupoEstudianteDto })
  @ApiResponse({ status: 201, description: 'Grupo-estudiante creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  create(@Body() dto: CreateGrupoEstudianteDto) {
    return this.grupoEstudianteService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar grupo-estudiante' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: CreateGrupoEstudianteDto })
  @ApiResponse({ status: 200, description: 'Grupo-estudiante actualizado' })
  @ApiResponse({ status: 404, description: 'Grupo-estudiante no encontrado' })
  update(@Param('id') id: number, @Body() dto: CreateGrupoEstudianteDto) {
    return this.grupoEstudianteService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar grupo-estudiante' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Grupo-estudiante eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Grupo-estudiante no encontrado' })
  remove(@Param('id') id: number) {
    return this.grupoEstudianteService.remove(id);
  }
}