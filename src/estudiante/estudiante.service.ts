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

@Injectable()
export class EstudianteService {
  //llamdo a variable de entorno
  //servicio grupos o inscripcion
  private readonly api_inscripcion: string = process.env.API_INSCRIPCION!;
  //servicio materias
  private readonly api_materias: string = process.env.API_MATERIAS!;
  //servicio academia
  private readonly api_acedemia: string = process.env.API_ACADEMIA!;
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
      createEstudianteDto.codigo = await bcrypt.hash(
        createEstudianteDto.codigo,
        10,
      );
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

  findByRegistroWithPassword(registro: string) {
    // Asegúrate que la entidad Estudiante tenga la propiedad 'codigo' seleccionable
    return this.estudianteRepository.findOne({
      where: { registro },
      select: [
        'id',
        'nombre',
        'email',
        'registro',
        'codigo',
        'telefono',
        'plan_estudio_id',
      ],
    });
  }
  async getMateriasDisponibles(estudianteId: number) {
    await this.findOne(estudianteId);

    // 1 sola llamada a grupos-service (que internamente llama a grupo-estudiante)
    const { materiasInscritas, materiasAprobadas } =
      await this.obtenerInfoMaterias(estudianteId);

    // 1 sola llamada a materias-service
    const todasLasMaterias = await this.obtenerMateriasConPrerequisitos();

    // Filtrar localmente
    return todasLasMaterias.filter(
      (materia) =>
        !materiasInscritas.includes(materia.id) &&
        this.cumplePrerequisitos(
          materia.prerequisitosIds || [],
          materiasAprobadas,
        ),
    );
  }

  private async obtenerInfoMaterias(estudianteId: number) {
    const url = `${this.api_inscripcion}/grupos/estudiante/${estudianteId}/materias-info`;
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }

  private async obtenerMateriasConPrerequisitos() {
    const url = `${this.api_materias}/materia/con-prerequisitos`;
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data || [];
  }

  private cumplePrerequisitos(
    prerequisitosIds: number[],
    materiasAprobadas: number[],
  ): boolean {
    return prerequisitosIds.every((prereqId) =>
      materiasAprobadas.includes(prereqId),
    );
  }
  private async validarPlanEstudio(plan_estudio_id: number): Promise<boolean> {
    try {
      const url = `${this.api_acedemia}/api/plan-estudio/${plan_estudio_id}`;
      await firstValueFrom(this.httpService.get(url));
      return true;
    } catch (error) {
      return false;
    }
  }
}
