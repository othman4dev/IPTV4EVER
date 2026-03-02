import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Announcement } from "./announcement.entity";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import { UpdateAnnouncementDto } from "./dto/update-announcement.dto";

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
  ) {}

  async create(dto: CreateAnnouncementDto): Promise<Announcement> {
    const announcement = this.announcementRepo.create(dto);
    return this.announcementRepo.save(announcement);
  }

  async findAll(): Promise<Announcement[]> {
    return this.announcementRepo.find({
      order: { order: "ASC" },
    });
  }

  async findActive(): Promise<Announcement[]> {
    return this.announcementRepo.find({
      where: { isActive: true },
      order: { order: "ASC" },
    });
  }

  async findOne(id: number): Promise<Announcement> {
    const announcement = await this.announcementRepo.findOne({ where: { id } });
    if (!announcement) throw new NotFoundException("Announcement not found");
    return announcement;
  }

  async update(id: number, dto: UpdateAnnouncementDto): Promise<Announcement> {
    const announcement = await this.findOne(id);
    Object.assign(announcement, dto);
    return this.announcementRepo.save(announcement);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.announcementRepo.delete(id);
  }
}
