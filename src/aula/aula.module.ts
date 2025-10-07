import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AulaService } from './aula.service';
import { AulaController } from './aula.controller';
import { Aula } from './entities/aula.entity';
import { Modulo } from '../modulo/entities/modulo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Aula, Modulo])],
  controllers: [AulaController],
  providers: [AulaService],
  exports: [AulaService],
})
export class AulaModule {}