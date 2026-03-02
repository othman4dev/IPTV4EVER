import { IPlanFeature } from "../../plan-feature/interfaces/plan-feature.interface";

export interface IPlan {
  id?: number;
  name: string;
  pricePerMonth: number;
  pricePer6Months: number;
  pricePerYear: number;
  color: string;
  thumb?: string | null;
  buttonText: string;
  order: number;
  features: IPlanFeature[];
}
