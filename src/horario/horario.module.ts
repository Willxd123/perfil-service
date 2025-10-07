import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorarioService } from './horario.service';
import { HorarioController } from './horario.controller';
import { Horario } from './entities/horario.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Aula } from '../aula/entities/aula.entity';
import { Modulo } from '../modulo/entities/modulo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Horario, Grupo, Aula, Modulo])],
  controllers: [HorarioController],
  providers: [HorarioService],
  exports: [HorarioService],
})
export class HorarioModule {}