import { IsString, IsNumber, IsOptional, IsInt, Min } from "class-validator";

export class CreatePlanDto {
  @IsString()
  name!: string;

  @IsNumber()
  pricePerMonth!: number;

  @IsNumber()
  pricePer6Months!: number;

  @IsNumber()
  pricePerYear!: number;

  @IsString()
  color!: string;

  @IsOptional()
  @IsString()
  thumb?: string;

  @IsString()
  buttonText!: string;

  @IsInt()
  @Min(1)
  order!: number;
}
