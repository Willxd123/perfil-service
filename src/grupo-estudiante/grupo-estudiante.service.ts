import { Gestion } from './entities/gestion.entity';
import { firstValueFrom } from 'rxjs';
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
    @InjectRepository(Gestion)
    private readonly gestionRepository: Repository<Gestion>,
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

  //lista historial del estudiante
  async findByEstudiante(estudianteId: number) {
    // 1. Obtener el historial simple del estudiante
    const historial = await this.grupoEstudianteRepository.find({
      where: { estudiante_id: estudianteId },
    });

    if (!historial || historial.length === 0) {
      throw new NotFoundException(
        `No se encontró historial para el estudiante con id ${estudianteId}`,
      );
    }

    // 2. Obtener TODAS las gestiones (para no consultar en bucle)
    const gestiones = await this.gestionRepository.find();
    const gestionMap = new Map(gestiones.map(g => [g.id, g]));

    // 3. Enriquecer el historial
    const historialEnriquecido = await Promise.all(
      historial.map(async (item) => {
        
        // 4. Obtener detalles del Grupo (para materiaId y gestionId)
        const grupo = await this.getGrupoDetails(item.grupo_id);
        if (!grupo) {
          return { ...item, materiaNombre: 'Error', materiaSigla: 'Error', gestionNombre: 'Error' };
        }

        // 5. Obtener detalles de la Materia (con el materiaId del grupo)
        const materia = await this.getMateriaDetails(grupo.materiaId);

        // 6. Obtener la gestión desde el mapa
        const gestion = gestionMap.get(grupo.gestionId);
        const gestionNombre = gestion 
          ? `${gestion.periodo}-${gestion.ano}` 
          : 'N/A';

        // 7. Combinar y devolver
        return {
          ...item,
          materiaNombre: materia ? materia.nombre : 'N/A',
          materiaSigla: materia ? materia.sigla : 'N/A',
          gestionNombre: gestionNombre,
        };
      })
    );

    return historialEnriquecido;
  }

  // --- MÉTODOS HELPER PRIVADOS ---

  private async getGrupoDetails(grupo_id: number): Promise<any | null> {
    try {
      // Corregido: localhost, no loc
      const url = `http://laravel.inscripciones/api/grupos/${grupo_id}`; 
      const response = await firstValueFrom(
        this.httpService.get<any>(url) // Se usa <any>
      );
      return response.data; // Devuelve el objeto del grupo
    } catch (error) {
      console.error('❌ Error obteniendo grupo:', error.message);
      return null;
    }
  }

  private async getMateriaDetails(materia_id: number): Promise<any | null> {
    try {
      // Asumo que esta es la URL del microservicio de materias
      const url = `http://academia-service:3000/api/materia/${materia_id}`; 
      const response = await firstValueFrom(
        this.httpService.get<any>(url) // Se usa <any>
      );
      return response.data; // Devuelve el objeto de materia
    } catch (error) {
      console.error('❌ Error obteniendo materia:', error.message);
      return null;
    }
  }

  private async validarGrupo(grupo_id: number): Promise<boolean> {
    const grupo = await this.getGrupoDetails(grupo_id);
    return !!grupo; // Devuelve true si el grupo no es null
  }
}