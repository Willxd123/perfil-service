import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { Grupo } from './entities/grupo.entity';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private readonly grupoRepository: Repository<Grupo>,
  ) {}

  async create(createGrupoDto: CreateGrupoDto): Promise<Grupo> {
    const grupo = this.grupoRepository.create(createGrupoDto);
    return await this.grupoRepository.save(grupo);
  }

  async findAll(): Promise<Grupo[]> {
    return await this.grupoRepository.find();
  }

  async findOne(id: number): Promise<Grupo> {
    const grupo = await this.grupoRepository.findOne({ where: { id } });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    return grupo;
  }

  async update(id: number, updateGrupoDto: UpdateGrupoDto): Promise<Grupo> {
    await this.findOne(id);
    await this.grupoRepository.update(id, updateGrupoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const grupo = await this.findOne(id);
    await this.grupoRepository.remove(grupo);
  }
}