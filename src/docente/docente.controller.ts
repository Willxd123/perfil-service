import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { DocenteService } from './docente.service';
import { CreateDocenteDto } from './dto/create-docente.dto';

@Controller('docentes')
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) {}

  @Get()
  findAll() {
    return this.docenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.docenteService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDocenteDto) {
    return this.docenteService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: CreateDocenteDto) {
    return this.docenteService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.docenteService.remove(id);
  }
}
