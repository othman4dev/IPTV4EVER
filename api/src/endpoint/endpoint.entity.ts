import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Endpoint {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, default: "iptv4ever" })
  playlistName!: string;

  @Column({ type: "varchar", length: 255 })
  username!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "text" })
  url!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
