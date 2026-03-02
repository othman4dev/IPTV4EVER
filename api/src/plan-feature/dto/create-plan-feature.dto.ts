import { IsInt, IsString, Min } from "class-validator";

export class CreatePlanFeatureDto {
  @IsInt()
  planId!: number;

  @IsString()
  description!: string;

  @IsInt()
  @Min(1)
  order!: number;
}
