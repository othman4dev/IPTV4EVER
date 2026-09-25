import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Slide } from "./slide.entity";
import { CreateSlideDto } from "./dto/create-slide.dto";
import { UpdateSlideDto } from "./dto/update-slide.dto";

@Injectable()
export class SlideService {
  constructor(
    @InjectRepository(Slide)
    private readonly slideRepo: Repository<Slide>,
  ) {}

  async create(dto: CreateSlideDto): Promise<Slide> {
    const slide = this.slideRepo.create(dto);
    return this.slideRepo.save(slide);
  }

  async findAll(): Promise<Slide[]> {
    return this.slideRepo.find({
      order: { order: "ASC" },
    });
  }

  async findActive(): Promise<Slide[]> {
    return this.slideRepo.find({
      where: { isActive: true },
      order: { order: "ASC" },
    });
  }

  async findOne(id: number): Promise<Slide> {
    const slide = await this.slideRepo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException("Slide not found");
    return slide;
  }

  async update(id: number, dto: UpdateSlideDto): Promise<Slide> {
    const slide = await this.findOne(id);
    Object.assign(slide, dto);
    return this.slideRepo.save(slide);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.slideRepo.delete(id);
  }
}
