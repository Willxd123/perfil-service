import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('grupo_estudiante')
export class GrupoEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  nota: number;

  @Column()
  creditos: number;

  @Column()
  estudiante_id: number;

  @Column()
  grupo_id: number;
}