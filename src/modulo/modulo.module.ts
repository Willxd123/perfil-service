import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuloService } from './modulo.service';
import { ModuloController } from './modulo.controller';
import { Modulo } from './entities/modulo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Modulo])],
  controllers: [ModuloController],
  providers: [ModuloService],
  exports: [ModuloService],
})
export class ModuloModule {}