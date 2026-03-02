import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Announcement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  icon!: string;

  @Column({ type: "text" })
  text!: string;

  @Column({ type: "int", default: 1, unique: true })
  order!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;
}
