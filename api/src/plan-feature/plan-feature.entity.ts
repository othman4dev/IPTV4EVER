import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Plan } from "../plan/plan.entity";

@Entity()
@Unique(["plan", "order"])
export class PlanFeature {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  description!: string;

  @Column({ type: "int", default: 1 })
  order!: number;

  @ManyToOne(() => Plan, (plan) => plan.features, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "plan_id" })
  plan!: Plan;
}
