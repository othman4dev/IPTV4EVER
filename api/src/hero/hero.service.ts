import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Hero } from "./hero.entity";
import { CreateHeroDto } from "./dto/create-hero.dto";
import { UpdateHeroDto } from "./dto/update-hero.dto";

@Injectable()
export class HeroService {
  constructor(
    @InjectRepository(Hero)
    private readonly heroRepo: Repository<Hero>,
  ) {}

  private async deactivateOtherHeroes(activeId?: number): Promise<void> {
    const where = activeId ? { isActive: true } : { isActive: true };
    const activeHeroes = await this.heroRepo.find({ where });

    for (const hero of activeHeroes) {
      if (activeId && hero.id === activeId) continue;
      hero.isActive = false;
      await this.heroRepo.save(hero);
    }
  }

  async create(dto: CreateHeroDto): Promise<Hero> {
    const hero = this.heroRepo.create(dto);
    const saved = await this.heroRepo.save(hero);

    if (saved.isActive) {
      await this.deactivateOtherHeroes(saved.id);
    }

    return this.findOne(saved.id);
  }

  async findAll(): Promise<Hero[]> {
    return this.heroRepo.find({
      order: {
        order: "ASC",
        createdAt: "DESC",
      },
    });
  }

  async findActive(): Promise<Hero[]> {
    return this.heroRepo.find({
      where: { isActive: true },
      order: {
        order: "ASC",
        createdAt: "DESC",
      },
    });
  }

  async findOne(id: number): Promise<Hero> {
    const hero = await this.heroRepo.findOne({ where: { id } });
    if (!hero) {
      throw new NotFoundException("Hero section entry not found");
    }
    return hero;
  }

  async update(id: number, dto: UpdateHeroDto): Promise<Hero> {
    const hero = await this.findOne(id);
    Object.assign(hero, dto);
    const saved = await this.heroRepo.save(hero);

    if (saved.isActive) {
      await this.deactivateOtherHeroes(saved.id);
    }

    return this.findOne(saved.id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.heroRepo.delete(id);
  }
}
