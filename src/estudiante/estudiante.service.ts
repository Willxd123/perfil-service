import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import * as bcrypt from 'bcryptjs';

// Asumiendo que tienes estas entidades y DTOs en algún lugar
// import { GrupoEstudiante } from '../grupo-estudiante/entities/grupo-estudiante.entity'; // O donde esté

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    private readonly httpService: HttpService,
    // Inject GrupoEstudianteRepository if needed for historial
    // @InjectRepository(GrupoEstudiante)
    // private readonly grupoEstudianteRepository: Repository<GrupoEstudiante>,
  ) {}

  // --- Métodos CRUD básicos (findAll, findOne, create, update, remove) ---
  // Estos métodos permanecen mayormente sin cambios.
  // Asegúrate de que update use 'save' si quieres hooks o validaciones completas.
  findAll() {
    return this.estudianteRepository.find();
  }

  async findOne(id: number) {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
    });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    }
    return estudiante;
  }

  async create(createEstudianteDto: CreateEstudianteDto) {
    const planEstudioExiste = await this.validarPlanEstudio(
      createEstudianteDto.plan_estudio_id,
    );
    if (!planEstudioExiste) {
      throw new NotFoundException('Plan de estudio no encontrado');
    }
     // Hash password on creation
     if (createEstudianteDto.codigo) {
      createEstudianteDto.codigo = await bcrypt.hash(createEstudianteDto.codigo, 10);
    }
    const estudiante = this.estudianteRepository.create(createEstudianteDto);
    return this.estudianteRepository.save(estudiante);
  }

  async update(id: number, updateEstudianteDto: Partial<CreateEstudianteDto>) {
    const estudiante = await this.findOne(id); // Usa findOne para asegurar que existe

    if (updateEstudianteDto.plan_estudio_id) {
      const planEstudioExiste = await this.validarPlanEstudio(
        updateEstudianteDto.plan_estudio_id,
      );
      if (!planEstudioExiste) {
        throw new NotFoundException('Plan de estudio no encontrado');
      }
    }

    if (updateEstudianteDto.codigo) {
      updateEstudianteDto.codigo = await bcrypt.hash(
        updateEstudianteDto.codigo,
        10,
      );
    }

    Object.assign(estudiante, updateEstudianteDto);
    return this.estudianteRepository.save(estudiante);
  }

  async remove(id: number) {
    const estudiante = await this.findOne(id);
    return this.estudianteRepository.remove(estudiante);
  }

  // --- Métodos de Autenticación / Específicos ---
  findByRegistroWithPassword(registro: string) {
    // Asegúrate que la entidad Estudiante tenga la propiedad 'codigo' seleccionable
    return this.estudianteRepository.findOne({
      where: { registro },
      select: ['id', 'nombre', 'email', 'registro', 'codigo', 'telefono', 'plan_estudio_id'],
    });
  }
  async getMateriasDisponibles(estudianteId: number) {
    await this.findOne(estudianteId);
    
    // 1 sola llamada a grupos-service (que internamente llama a grupo-estudiante)
    const { materiasInscritas, materiasAprobadas } = await this.obtenerInfoMaterias(estudianteId);
    
    // 1 sola llamada a materias-service
    const todasLasMaterias = await this.obtenerMateriasConPrerequisitos();
    
    // Filtrar localmente
    return todasLasMaterias.filter(materia => 
      !materiasInscritas.includes(materia.id) && 
      this.cumplePrerequisitos(materia.prerequisitosIds || [], materiasAprobadas)
    );
  }
  
  private async obtenerInfoMaterias(estudianteId: number) {
    const url = `http://localhost:3001/api/grupo/estudiante/${estudianteId}/materias-info`;
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }
  
  private async obtenerMateriasConPrerequisitos() {
    const url = 'http://localhost:3000/api/materia/con-prerequisitos';
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data || [];
  }
  
  private cumplePrerequisitos(prerequisitosIds: number[], materiasAprobadas: number[]): boolean {
    return prerequisitosIds.every(prereqId => materiasAprobadas.includes(prereqId));
  }
  private async validarPlanEstudio(plan_estudio_id: number): Promise<boolean> {
    try {
      const url = `http://localhost:3003/api/plan-estudio/${plan_estudio_id}`;
      await firstValueFrom(this.httpService.get(url));
      return true;
    } catch (error) {
      return false;
    }
  }



  

}
