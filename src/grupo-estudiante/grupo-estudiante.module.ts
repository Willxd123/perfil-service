import { Module } from '@nestjs/common';
import { GrupoEstudianteService } from './grupo-estudiante.service';
import { GrupoEstudianteController } from './grupo-estudiante.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoEstudiante } from './entities/grupo-estudiante.entity';
import { HttpModule } from '@nestjs/axios';
import { Gestion } from './entities/gestion.entity';

@Module({
  
  imports: [HttpModule,TypeOrmModule.forFeature([GrupoEstudiante, Gestion]), HttpModule],
  controllers: [GrupoEstudianteController],
  providers: [GrupoEstudianteService],
})
export class GrupoEstudianteModule {}
