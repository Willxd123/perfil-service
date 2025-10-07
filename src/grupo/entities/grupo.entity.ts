import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Horario } from '../../horario/entities/horario.entity';

@Entity('grupos')
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  sigla: string;

  @Column({ type: 'integer' })
  cupo: number;

  @Column({ name: 'materia_id' })
  materiaId: number;

  @Column({ name: 'docente_id' })
  docenteId: number;

  @Column({ type: 'varchar', length: 255 })
  gestion: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Horario, (horario) => horario.grupo)
  horarios: Horario[];
}