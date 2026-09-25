import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Slide {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 255 })
  subtitle!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 100 })
  icon!: string;

  @Column({ type: "varchar", length: 7, default: "#FF3B3B" })
  background!: string;

  @Column({ type: "varchar", length: 7, default: "#FFFFFF" })
  textColor!: string;

  @Column({ type: "int", default: 30 })
  backgroundDim!: number; // 0-100, opacity % of overlay

  @Column({ type: "boolean", default: false })
  hasTextBorder!: boolean;

  @Column({ type: "varchar", length: 7, default: "#000000", nullable: true })
  textBorderColor?: string;

  @Column({ type: "text", nullable: true })
  bgImage?: string;

  @Column({ type: "int", default: 1, unique: true })
  order!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
