import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlanFeature } from "./plan-feature.entity";
import { CreatePlanFeatureDto } from "./dto/create-plan-feature.dto";
import { UpdatePlanFeatureDto } from "./dto/update-plan-feature.dto";
import { Plan } from "../plan/plan.entity";

@Injectable()
export class PlanFeatureService {
  constructor(
    @InjectRepository(PlanFeature)
    private readonly planFeatureRepo: Repository<PlanFeature>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async create(
    createPlanFeatureDto: CreatePlanFeatureDto,
  ): Promise<PlanFeature> {
    const plan = await this.planRepo.findOne({
      where: { id: createPlanFeatureDto.planId },
    });
    if (!plan) throw new NotFoundException("Plan not found");
    const planFeature = this.planFeatureRepo.create({
      description: createPlanFeatureDto.description,
      order: createPlanFeatureDto.order,
      plan,
    });
    return this.planFeatureRepo.save(planFeature);
  }

  async findAll(): Promise<PlanFeature[]> {
    return this.planFeatureRepo.find({ order: { order: "ASC" } });
  }

  async findOne(id: number): Promise<PlanFeature> {
    const planFeature = await this.planFeatureRepo.findOne({ where: { id } });
    if (!planFeature) throw new NotFoundException("Plan Feature not found");
    return planFeature;
  }

  async update(
    id: number,
    updatePlanFeatureDto: UpdatePlanFeatureDto,
  ): Promise<PlanFeature> {
    const planFeature = await this.findOne(id);
    const { planId, ...rest } = updatePlanFeatureDto;

    if (planId !== undefined) {
      const plan = await this.planRepo.findOne({ where: { id: planId } });
      if (!plan) throw new NotFoundException("Plan not found");
      planFeature.plan = plan;
    }

    Object.assign(planFeature, rest);
    return this.planFeatureRepo.save(planFeature);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.planFeatureRepo.delete(id);
  }
}
