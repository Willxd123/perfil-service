import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    private readonly httpService: HttpService,
  ) {}

  findAll() {
    return this.estudianteRepository.find();
  }

  async findOne(id: number) {
    const estudiante = await this.estudianteRepository.findOne({ 
      where: { id } 
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    }

    return estudiante;
  }

  async create(createEstudianteDto: CreateEstudianteDto) {
    // Validar que el plan de estudio existe en plan-estudio-service
    const planEstudioExiste = await this.validarPlanEstudio(createEstudianteDto.plan_estudio_id);
    if (!planEstudioExiste) {
      throw new NotFoundException('Plan de estudio no encontrado');
    }
  
    // Si todo OK, crear el estudiante
    const estudiante = this.estudianteRepository.create(createEstudianteDto);
    return this.estudianteRepository.save(estudiante);
  }
  
  async update(id: number, data: Partial<CreateEstudianteDto>) {
    // Validar que el plan de estudio existe si se está actualizando el plan_estudio_id
    if (data.plan_estudio_id) {
      const planEstudioExiste = await this.validarPlanEstudio(data.plan_estudio_id);
      if (!planEstudioExiste) {
        throw new NotFoundException('Plan de estudio no encontrado');
      }
    }
  
    // Actualizar el estudiante
    await this.estudianteRepository.update(id, data);
    return this.findOne(id);
  }
  
  private async validarPlanEstudio(plan_estudio_id: number): Promise<boolean> {
    try {
      await this.httpService
        .get(`http://localhost:3003/api/plan-estudio/${plan_estudio_id}`)
        .toPromise();
      return true;
    } catch {
      return false;
    }
  }

  async remove(id: number) {
    const estudiante = await this.findOne(id);
    return this.estudianteRepository.remove(estudiante);
  }
}
