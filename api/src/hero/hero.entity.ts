import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum HeroMediaType {
  IMAGE = "image",
  VIDEO = "video",
}

@Entity()
export class Hero {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 120 })
  titleLine1Prefix!: string;

  @Column({ type: "varchar", length: 120 })
  titleLine1Highlight!: string;

  @Column({ type: "varchar", length: 120 })
  titleLine1Suffix!: string;

  @Column({ type: "varchar", length: 120 })
  titleLine2Prefix!: string;

  @Column({ type: "varchar", length: 120 })
  titleLine2Highlight!: string;

  @Column({ type: "varchar", length: 120 })
  titleLine2Suffix!: string;

  @Column({ type: "varchar", length: 255 })
  subtitle!: string;

  @Column({ type: "varchar", length: 100 })
  primaryButtonText!: string;

  @Column({ type: "varchar", length: 500 })
  primaryButtonLink!: string;

  @Column({ type: "varchar", length: 100 })
  secondaryButtonText!: string;

  @Column({ type: "varchar", length: 500 })
  secondaryButtonLink!: string;

  @Column({ type: "enum", enum: HeroMediaType, default: HeroMediaType.IMAGE })
  mediaType!: HeroMediaType;

  @Column({ type: "text" })
  mediaPath!: string;

  @Column({ type: "int", default: 1 })
  order!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "varchar", length: 50, default: "minimalistic" })
  heroStyle!: string;

  /** "difference" = mix-blend-mode:difference | "solid" = plain colour */
  @Column({ type: "varchar", length: 20, default: "difference" })
  textMode!: string;

  /** Hex colour used when textMode = "solid" */
  @Column({ type: "varchar", length: 20, default: "#ffffff" })
  textColor!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
