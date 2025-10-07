import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AulaService } from './aula.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

@ApiTags('aulas')
@Controller('aula')
export class AulaController {
  constructor(private readonly aulaService: AulaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva aula' })
  @ApiResponse({ status: 201, description: 'Aula creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createAulaDto: CreateAulaDto) {
    return this.aulaService.create(createAulaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las aulas' })
  @ApiResponse({ status: 200, description: 'Lista de aulas con sus módulos' })
  findAll() {
    return this.aulaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un aula por ID' })
  @ApiResponse({ status: 200, description: 'Aula encontrada' })
  @ApiResponse({ status: 404, description: 'Aula no encontrada' })
  findOne(@Param('id') id: string) {
    return this.aulaService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un aula' })
  @ApiResponse({ status: 200, description: 'Aula actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Aula no encontrada' })
  update(@Param('id') id: string, @Body() updateAulaDto: UpdateAulaDto) {
    return this.aulaService.update(+id, updateAulaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un aula' })
  @ApiResponse({ status: 204, description: 'Aula eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Aula no encontrada' })
  remove(@Param('id') id: string) {
    return this.aulaService.remove(+id);
  }
}