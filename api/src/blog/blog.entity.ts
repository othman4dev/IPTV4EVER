import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export interface BlogMedia {
  url: string;
  type: "image" | "video";
  caption?: string;
}

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  excerpt?: string;

  @Column({ type: "longtext" })
  content!: string;

  @Column({ type: "text", nullable: true })
  coverImage?: string;

  @Column({ type: "json", nullable: true })
  media!: BlogMedia[];

  @Column({ type: "int", default: 1 })
  order!: number;

  @Column({ type: "boolean", default: false })
  isPublished!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
