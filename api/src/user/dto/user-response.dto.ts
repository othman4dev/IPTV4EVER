export class SubscriptionSummaryDto {
  id!: number;
  planName!: string;
  status!: string;
  startDate!: Date;
  endDate!: Date | null;
  pricePaid!: number;
}

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  role!: string;
  isBanned!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  subscription!: SubscriptionSummaryDto | null;
}
