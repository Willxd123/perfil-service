import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ModuloService } from './modulo.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@ApiTags('modulos')
@Controller('modulo')
export class ModuloController {
  constructor(private readonly moduloService: ModuloService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo módulo' })
  @ApiResponse({ status: 201, description: 'Módulo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createModuloDto: CreateModuloDto) {
    return this.moduloService.create(createModuloDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los módulos' })
  @ApiResponse({ status: 200, description: 'Lista de módulos' })
  findAll() {
    return this.moduloService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un módulo por ID' })
  @ApiResponse({ status: 200, description: 'Módulo encontrado' })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.moduloService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un módulo' })
  @ApiResponse({ status: 200, description: 'Módulo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  update(@Param('id') id: string, @Body() updateModuloDto: UpdateModuloDto) {
    return this.moduloService.update(+id, updateModuloDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un módulo' })
  @ApiResponse({ status: 204, description: 'Módulo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  remove(@Param('id') id: string) {
    return this.moduloService.remove(+id);
  }
}