import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../auth/entities/user.entity";
import { Plan } from "../plan/plan.entity";

export enum SubscriptionStatus {
  PENDING = "pending",
  ONGOING = "ongoing",
  PAUSED = "paused",
  EXPIRED = "expired",
}

@Entity("subscriptions")
export class Subscription {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", eager: false })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Plan, { onDelete: "CASCADE", eager: false })
  @JoinColumn({ name: "plan_id" })
  plan!: Plan;

  @Column({
    type: "enum",
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status!: SubscriptionStatus;

  @Column({ type: "date" })
  startDate!: Date;

  @Column({ type: "date", nullable: true })
  endDate!: Date | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  pricePaid!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
