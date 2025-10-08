import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrupoEstudiante } from './entities/grupo-estudiante.entity';
import { CreateGrupoEstudianteDto } from './dto/create-grupo-estudiante.dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GrupoEstudianteService {
  constructor(
    @InjectRepository(GrupoEstudiante)
    private readonly grupoEstudianteRepository: Repository<GrupoEstudiante>,
    private readonly httpService: HttpService,
  ) {}

  findAll() {
    return this.grupoEstudianteRepository.find();
  }

  async findOne(id: number) {
    const grupoEstudiante = await this.grupoEstudianteRepository.findOne({ 
      where: { id } 
    });

    if (!grupoEstudiante) {
      throw new NotFoundException(`GrupoEstudiante con id ${id} no encontrado`);
    }

    return grupoEstudiante;
  }

  async create(dto: CreateGrupoEstudianteDto) {
    // Validar que el grupo existe en grupo-service
    const grupoExiste = await this.validarGrupo(dto.grupo_id);
    if (!grupoExiste) {
      throw new NotFoundException('Grupo no encontrado');
    }
  
    // Si todo OK, crear la relación grupo-estudiante
    const grupoEstudiante = this.grupoEstudianteRepository.create(dto);
    return this.grupoEstudianteRepository.save(grupoEstudiante);
  }
  
  private async validarGrupo(grupo_id: number): Promise<boolean> {
    try {
      await this.httpService
        .get(`http://localhost:3001/api/grupo/${grupo_id}`)
        .toPromise();
      return true;
    } catch {
      return false;
    }
  }
  async update(id: number, data: Partial<CreateGrupoEstudianteDto>) {
    // Validar que el grupo existe si se está actualizando el grupo_id
    if (data.grupo_id) {
      const grupoExiste = await this.validarGrupo(data.grupo_id);
      if (!grupoExiste) {
        throw new NotFoundException('Grupo no encontrado');
      }
    }
  
    // Buscar el grupo-estudiante existente
    const grupoEstudiante = await this.findOne(id);
    
    // Actualizar los datos
    Object.assign(grupoEstudiante, data);
    
    return this.grupoEstudianteRepository.save(grupoEstudiante);
  }

  async remove(id: number) {
    const grupoEstudiante = await this.findOne(id);
    return this.grupoEstudianteRepository.remove(grupoEstudiante);
  }
}