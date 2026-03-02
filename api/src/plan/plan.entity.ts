import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PlanFeature } from "../plan-feature/plan-feature.entity";

@Entity()
export class Plan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  pricePerMonth!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  pricePer6Months!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  pricePerYear!: number;

  @Column({ type: "varchar", length: 32 })
  color!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  thumb!: string | null;

  @Column({ type: "varchar", length: 64 })
  buttonText!: string;

  @Column({ type: "int", default: 1, unique: true })
  order!: number;

  @OneToMany(() => PlanFeature, (feature) => feature.plan)
  features!: PlanFeature[];
}
