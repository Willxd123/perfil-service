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
    // Validar que el plan de estudio existe en plan-estudio-service
    const planEstudioExiste = await this.validarPlanEstudio(
      createEstudianteDto.plan_estudio_id,
    );
    if (!planEstudioExiste) {
      throw new NotFoundException('Plan de estudio no encontrado');
    }

    // Si todo OK, crear el estudiante
    const estudiante = this.estudianteRepository.create(createEstudianteDto);
    return this.estudianteRepository.save(estudiante);
  }

  
  async update(id: number, updateEstudianteDto: Partial<CreateEstudianteDto>) {
    const estudiante = await this.estudianteRepository.findOneBy({ id });
    if (!estudiante)
      throw new NotFoundException(`Estudiante con id ${id} no encontrado`);

    // Validar que el plan de estudio existe si se está actualizando el plan_estudio_id
    if (updateEstudianteDto.plan_estudio_id) {
      const planEstudioExiste = await this.validarPlanEstudio(
        updateEstudianteDto.plan_estudio_id,
      );
      if (!planEstudioExiste) {
        throw new NotFoundException('Plan de estudio no encontrado');
      }
    }

    // Encriptar la codigo si se está actualizando
    if (updateEstudianteDto.codigo) {
      updateEstudianteDto.codigo = await bcrypt.hash(
        updateEstudianteDto.codigo,
        10,
      );
    }

    // Usar save en lugar de update para que los hooks (si los hubiera) se activen
    Object.assign(estudiante, updateEstudianteDto);
    return this.estudianteRepository.save(estudiante);
  }

  private async validarPlanEstudio(plan_estudio_id: number): Promise<boolean> {
    try {
      // Reemplazar .toPromise() obsoleto por firstValueFrom
      await firstValueFrom(
        this.httpService
          .get(`http://localhost:3003/api/plan-estudio/${plan_estudio_id}`)
      );
      return true;
    } catch {
      return false;
    }
  }

  async remove(id: number) {
    const estudiante = await this.findOne(id);
    return this.estudianteRepository.remove(estudiante);
  }

  findByRegistroWithPassword(registro: string) {
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
  
  // --------------------------------------------------------------------------
  // LÓGICA DE NEGOCIO PRINCIPAL
  // --------------------------------------------------------------------------

  async getMateriasDisponibles(estudianteId: number) {
    try {
      // PASO 1: Obtener datos del estudiante
      const estudiante = await this.findOne(estudianteId);

      // PASO 2: Obtener materias del plan de estudio
      const planResponse = await firstValueFrom(
        this.httpService.get(
          `http://localhost:3003/api/plan-estudio/${estudiante.plan_estudio_id}`,
        ),
      );
      const materiasDelPlanIds = planResponse.data.materias.map(
        (m) => m.materia_id,
      ); 

      // PASO 3: Obtener historial académico del estudiante
      const historialResponse = await firstValueFrom(
        this.httpService.get(`http://localhost:3002/api/grupos-estudiantes`),
      );
      const historialEstudiante = historialResponse.data.filter(
        (ge) => ge.estudiante_id === estudianteId,
      );

      // PASO 4: Obtener todas las materias (con objetos 'nivel' y 'tipo' anidados)
      const materiasResponse = await firstValueFrom(
        this.httpService.get(`http://localhost:3000/api/materia`),
      );
      const todasLasMaterias = materiasResponse.data;

      // PASO 5: Crear mapa grupo_id -> materia_id 
      // (Esta sigue siendo la parte más lenta, idealmente se optimizaría)
      const grupoIdToMateriaIdMap = new Map<number, number>();
      const grupoIds = [...new Set(historialEstudiante.map((h) => h.grupo_id))];

      for (const grupoId of grupoIds) {
        if (!grupoId) continue; // Saltar si el grupo_id es nulo
        try {
          const grupoResponse = await firstValueFrom(
            this.httpService.get(`http://localhost:3001/api/grupo/${grupoId}`),
          );
          grupoIdToMateriaIdMap.set(
            grupoId as number,
            grupoResponse.data.materiaId,
          );
        } catch (error) {
          console.warn(`No se pudo obtener grupo ${grupoId}`);
        }
      }

      // PASO 6: Filtrar materias del plan
      const materiasDelPlanCompletas = todasLasMaterias.filter((materia) =>
        materiasDelPlanIds.includes(materia.id),
      );

      // PASO 7: Calcular nivel actual del estudiante
      const nivelActual = this.calcularNivelActual(
        historialEstudiante,
        materiasDelPlanCompletas,
        grupoIdToMateriaIdMap,
      );

      // PASO 8: Filtrar materias disponibles
      const materiasDisponibles: any[] = []; // Especificar tipo 'any[]' para TypeScript

      for (const materia of materiasDelPlanCompletas) {
        // Filtro 1: Nivel <= actual
        if (materia.nivelId > nivelActual) continue;

        // Filtro 2: No aprobada previamente
        const yaAprobada = historialEstudiante.some((h) => {
          if (!h.grupo_id) return false;

          const perteneceAEstaMateria = this.perteneceAMateria(
            h.grupo_id,
            materia.id,
            grupoIdToMateriaIdMap,
          );
          if (!perteneceAEstaMateria) return false;

          return h.nota >= 51; // Solo excluir si está APROBADA
        });
        if (yaAprobada) continue;

        // Filtro 3: Prerequisites cumplidos
        const prerequisitosCumplidos = await this.validarPrerequisitos(
          materia.id,
          historialEstudiante,
          grupoIdToMateriaIdMap,
        );
        if (!prerequisitosCumplidos) continue;

        // --- CAMBIO PRINCIPAL ---
        // Construir el objeto de materia con la estructura completa
        // que el frontend espera (similar a la API antigua)
        materiasDisponibles.push({
          id: materia.id,
          sigla: materia.sigla,
          nombre: materia.nombre,
          creditos: materia.creditos,
          nivelId: materia.nivelId,
          tipoId: materia.tipoId,
          createdAt: materia.createdAt || null,
          updatedAt: materia.updatedAt || null,
          nivel: materia.nivel, // <-- Objeto anidado completo
          tipo: materia.tipo,   // <-- Objeto anidado completo
        });
      }

      // Devolver el objeto completo (el controlador se encargará de extraer el arreglo)
      return {
        estudiante_id: estudianteId,
        nivel_actual: nivelActual,
        plan_estudio: planResponse.data.codigo,
        materias_disponibles: materiasDisponibles,
      };
    } catch (error) {
      console.error('Error en getMateriasDisponibles:', error.message, error.stack);
      throw new InternalServerErrorException(
        'Error al obtener materias disponibles',
      );
    }
  }

  // --- MÉTODOS HELPER ---

  private obtenerMateriaIdDeGrupo(
    grupo_id: number,
    mapa: Map<number, number>,
  ): number | null {
    return mapa.get(grupo_id) || null;
  }

  private perteneceAMateria(
    grupo_id: number,
    materia_id: number,
    mapa: Map<number, number>,
  ): boolean {
    return mapa.get(grupo_id) === materia_id;
  }
  
  private calcularNivelActual(
    historial: any[],
    materiasDelPlan: any[],
    mapa: Map<number, number>,
  ): number {
    // Crea un Set con los IDs de las materias aprobadas (nota >= 51)
    const materiasAprobadasIds = new Set(
      historial
        .filter((h) => h.nota >= 51)
        .map((h) => this.obtenerMateriaIdDeGrupo(h.grupo_id, mapa))
        .filter((id): id is number => id !== null), // Filtra nulos y asegura el tipo
    );
  
    // Si no ha aprobado nada, su nivel es 1 (caso base para estudiante nuevo).
    if (materiasAprobadasIds.size === 0) {
      return 1;
    }
  
    // Busca el nivel más alto entre todas las materias que ha aprobado.
    const maxLevelAprobado = materiasDelPlan.reduce((maxLevel, materia) => {
      // Si la materia está en el set de aprobadas, compara su nivel.
      if (materiasAprobadasIds.has(materia.id)) {
        return Math.max(maxLevel, materia.nivelId);
      }
      return maxLevel;
    }, 0); // El valor inicial es 0.
  
    // El nivel actual es 1 más el nivel máximo de las materias que ya superó.
    return maxLevelAprobado + 1;
  }

  private async validarPrerequisitos(
    materiaId: number,
    historial: any[],
    mapa: Map<number, number>,
  ): Promise<boolean> {
    try {
      const materiaResponse = await firstValueFrom(
        this.httpService.get(`http://localhost:3000/api/materia/${materiaId}`),
      );

      const prerequisitos = materiaResponse.data.prerequisitos || [];
      if (prerequisitos.length === 0) return true; // No tiene prerequisitos

      const materiasAprobadasIds = historial
        .filter((h) => h.nota >= 51)
        .map((h) => this.obtenerMateriaIdDeGrupo(h.grupo_id, mapa)) 
        .filter((id) => id !== null);

      return prerequisitos.every((p) =>
        materiasAprobadasIds.includes(p.prerequisito_id || p.prerequisitoId),
      );
    } catch {
      return true; 
    }
  }
}

