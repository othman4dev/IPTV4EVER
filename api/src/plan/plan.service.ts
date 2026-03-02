import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Plan } from "./plan.entity";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const plan = this.planRepo.create(createPlanDto);
    return this.planRepo.save(plan);
  }

  async findAll(): Promise<Plan[]> {
    return this.planRepo.find({
      relations: ["features"],
      order: { order: "ASC", features: { order: "ASC" } },
    });
  }

  async findOne(id: number): Promise<Plan> {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ["features"],
      order: { features: { order: "ASC" } },
    });
    if (!plan) throw new NotFoundException("Plan not found");
    return plan;
  }

  async update(id: number, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);
    Object.assign(plan, updatePlanDto);
    return this.planRepo.save(plan);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.planRepo.delete(id);
  }
}
