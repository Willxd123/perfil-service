import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Aula } from '../../aula/entities/aula.entity';
import { Horario } from '../../horario/entities/horario.entity';

@Entity('modulos')
export class Modulo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  numero: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Aula, (aula) => aula.modulo)
  aulas: Aula[];

  @OneToMany(() => Horario, (horario) => horario.modulo)
  horarios: Horario[];
}