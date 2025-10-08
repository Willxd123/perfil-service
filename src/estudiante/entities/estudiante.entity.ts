import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('estudiantes')
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  registro: string;

  @Column()
  nombre: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  user_id: number; // referencia a users en servicio madre

  @Column()
  plan_estudio_id: number; // referencia a plan de estudio
}
