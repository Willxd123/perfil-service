import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('docentes')
export class Docente {
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
}
