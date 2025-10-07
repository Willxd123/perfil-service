import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { Aula } from './entities/aula.entity';

@Injectable()
export class AulaService {
  constructor(
    @InjectRepository(Aula)
    private readonly aulaRepository: Repository<Aula>,
  ) {}

  async create(createAulaDto: CreateAulaDto): Promise<Aula> {
    const aula = this.aulaRepository.create(createAulaDto);
    return await this.aulaRepository.save(aula);
  }

  async findAll(): Promise<Aula[]> {
    return await this.aulaRepository.find({
      relations: ['modulo'],
    });
  }

  async findOne(id: number): Promise<Aula> {
    const aula = await this.aulaRepository.findOne({
      where: { id },
      relations: ['modulo'],
    });
    if (!aula) {
      throw new NotFoundException(`Aula con ID ${id} no encontrada`);
    }
    return aula;
  }

  async update(id: number, updateAulaDto: UpdateAulaDto): Promise<Aula> {
    await this.findOne(id);
    await this.aulaRepository.update(id, updateAulaDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const aula = await this.findOne(id);
    await this.aulaRepository.remove(aula);
  }
}