import {
  IsEnum,
  IsUUID,
  IsInt,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from "class-validator";
import { SubscriptionStatus } from "../subscription.entity";

export class CreateSubscriptionDto {
  @IsUUID()
  userId!: string;

  @IsInt()
  planId!: number;

  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsNumber()
  @Min(0)
  pricePaid!: number;
}
