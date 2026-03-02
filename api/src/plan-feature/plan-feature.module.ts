import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlanFeature } from "./plan-feature.entity";
import { PlanFeatureService } from "./plan-feature.service";
import { PlanFeatureController } from "./plan-feature.controller";
import { Plan } from "../plan/plan.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PlanFeature, Plan])],
  providers: [PlanFeatureService],
  controllers: [PlanFeatureController],
  exports: [PlanFeatureService],
})
export class PlanFeatureModule {}
