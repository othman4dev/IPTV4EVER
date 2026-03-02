import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Subscription, SubscriptionStatus } from "./subscription.entity";
import { User } from "../auth/entities/user.entity";
import { Plan } from "../plan/plan.entity";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async create(dto: CreateSubscriptionDto): Promise<Subscription> {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId as unknown as string },
    });
    if (!user) throw new NotFoundException("User not found");

    const plan = await this.planRepo.findOne({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException("Plan not found");

    const sub = this.subRepo.create({
      user,
      plan,
      status: dto.status,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      pricePaid: dto.pricePaid,
    });
    return this.subRepo.save(sub);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subRepo.find({
      relations: ["user", "plan"],
      order: { createdAt: "DESC" },
    });
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    return this.subRepo.find({
      where: { user: { id: userId } },
      relations: ["plan"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number): Promise<Subscription> {
    const sub = await this.subRepo.findOne({
      where: { id },
      relations: ["user", "plan"],
    });
    if (!sub) throw new NotFoundException("Subscription not found");
    return sub;
  }

  async update(id: number, dto: UpdateSubscriptionDto): Promise<Subscription> {
    const sub = await this.findOne(id);

    if (dto.userId !== undefined) {
      const user = await this.userRepo.findOne({
        where: { id: dto.userId as unknown as string },
      });
      if (!user) throw new NotFoundException("User not found");
      sub.user = user;
    }
    if (dto.planId !== undefined) {
      const plan = await this.planRepo.findOne({ where: { id: dto.planId } });
      if (!plan) throw new NotFoundException("Plan not found");
      sub.plan = plan;
    }
    if (dto.status !== undefined) sub.status = dto.status;
    if (dto.startDate !== undefined) sub.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      sub.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.pricePaid !== undefined) sub.pricePaid = dto.pricePaid;

    return this.subRepo.save(sub);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.subRepo.delete(id);
  }

  /** Returns the most recent active/pending subscription for each userId */
  async findActiveByUserIds(
    userIds: string[],
  ): Promise<Record<string, Subscription>> {
    if (userIds.length === 0) return {};
    const subs = await this.subRepo.find({
      where: {
        user: { id: In(userIds) },
        status: In([SubscriptionStatus.ONGOING, SubscriptionStatus.PENDING]),
      },
      relations: ["user", "plan"],
      order: { createdAt: "DESC" },
    });
    const map: Record<string, Subscription> = {};
    for (const s of subs) {
      if (!map[s.user.id]) map[s.user.id] = s;
    }
    return map;
  }
}
