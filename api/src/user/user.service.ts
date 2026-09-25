import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "../auth/entities/user.entity";
import { Subscription } from "../subscription/subscription.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  UserResponseDto,
  SubscriptionSummaryDto,
} from "./dto/user-response.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
  ) {}

  private toResponse(
    user: User,
    subscription: Subscription | null = null,
  ): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.phone = user.phone ?? null;
    dto.role = user.role;
    dto.isBanned = user.isBanned;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;

    if (subscription) {
      const sub = new SubscriptionSummaryDto();
      sub.id = subscription.id;
      sub.planName = subscription.plan?.name ?? "Unknown";
      sub.status = subscription.status;
      sub.startDate = subscription.startDate;
      sub.endDate = subscription.endDate;
      sub.pricePaid = Number(subscription.pricePaid);
      dto.subscription = sub;
    } else {
      dto.subscription = null;
    }

    return dto;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (existing)
      throw new ConflictException("A user with this email already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const saved = await this.userRepo.save(user);
    return this.toResponse(saved, null);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepo.find({ order: { createdAt: "ASC" } });
    if (users.length === 0) return [];

    const userIds = users.map((u) => u.id);

    const allSubs = await this.subRepo
      .createQueryBuilder("sub")
      .leftJoinAndSelect("sub.plan", "plan")
      .leftJoinAndSelect("sub.user", "user")
      .where("user.id IN (:...ids)", { ids: userIds })
      .andWhere("sub.status IN (:...statuses)", {
        statuses: ["ongoing", "pending"],
      })
      .orderBy("sub.createdAt", "DESC")
      .getMany();

    const subByUser: Record<string, Subscription> = {};
    for (const s of allSubs) {
      if (!subByUser[s.user.id]) subByUser[s.user.id] = s;
    }

    return users.map((u) => this.toResponse(u, subByUser[u.id] ?? null));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    const sub =
      (await this.subRepo.findOne({
        where: { user: { id }, status: "ongoing" as any },
        relations: ["plan"],
        order: { createdAt: "DESC" },
      })) ??
      (await this.subRepo.findOne({
        where: { user: { id }, status: "pending" as any },
        relations: ["plan"],
        order: { createdAt: "DESC" },
      }));

    return this.toResponse(user, sub ?? null);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: updateUserDto.email },
      });
      if (existing)
        throw new ConflictException("A user with this email already exists");
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    Object.assign(user, updateUserDto);
    const saved = await this.userRepo.save(user);
    return this.toResponse(saved, null);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    await this.userRepo.delete(id);
  }

  async ban(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    user.isBanned = true;
    const saved = await this.userRepo.save(user);
    return this.toResponse(saved, null);
  }

  async unban(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    user.isBanned = false;
    const saved = await this.userRepo.save(user);
    return this.toResponse(saved, null);
  }
}
