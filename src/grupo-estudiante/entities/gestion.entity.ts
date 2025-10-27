import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('gestiones')
export class Gestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ano: number;

  @Column()
  periodo: number;
}
