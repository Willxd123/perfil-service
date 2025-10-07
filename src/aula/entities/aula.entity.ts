import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Modulo } from '../../modulo/entities/modulo.entity';
import { Horario } from '../../horario/entities/horario.entity';

@Entity('aulas')
export class Aula {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  numero: string;

  @Column({ name: 'modulo_id' })
  moduloId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Modulo, (modulo) => modulo.aulas)
  @JoinColumn({ name: 'modulo_id' })
  modulo: Modulo;

  @OneToMany(() => Horario, (horario) => horario.aula)
  horarios: Horario[];
}