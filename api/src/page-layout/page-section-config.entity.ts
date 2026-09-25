import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("page_section_configs")
@Unique(["page", "sectionKey"])
export class PageSectionConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 50, default: "home" })
  page!: string;

  @Column({ type: "varchar", length: 50 })
  sectionKey!: string;

  @Column({ type: "varchar", length: 100 })
  label!: string;

  @Column({ type: "varchar", length: 80, default: "bi-layout-text-sidebar" })
  icon!: string;

  @Column({ type: "boolean", default: true })
  isVisible!: boolean;

  @Column({ type: "int", default: 0 })
  order!: number;

  @Column({ type: "varchar", length: 50, default: "default" })
  variant!: string;

  @Column({ type: "varchar", length: 2000, default: "{}" })
  config!: string;
}
