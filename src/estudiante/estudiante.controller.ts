import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';

@ApiTags('Estudiantes')
@Controller('estudiantes')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los estudiantes' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes' })
  findAll() {
    return this.estudianteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estudiante por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Estudiante encontrado' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  findOne(@Param('id') id: number) {
    return this.estudianteService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear estudiante' })
  @ApiBody({ type: CreateEstudianteDto })
  @ApiResponse({ status: 201, description: 'Estudiante creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Plan de estudio no encontrado' })
  create(@Body() dto: CreateEstudianteDto) {
    return this.estudianteService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar estudiante' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: CreateEstudianteDto })
  @ApiResponse({ status: 200, description: 'Estudiante actualizado' })
  @ApiResponse({ status: 404, description: 'Estudiante o plan de estudio no encontrado' })
  update(@Param('id') id: number, @Body() dto: CreateEstudianteDto) {
    return this.estudianteService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar estudiante' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Estudiante eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  remove(@Param('id') id: number) {
    return this.estudianteService.remove(id);
  }
}