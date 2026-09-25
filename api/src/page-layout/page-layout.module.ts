import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PageLayoutController } from "./page-layout.controller";
import { PageLayoutService } from "./page-layout.service";
import { PageSectionConfig } from "./page-section-config.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PageSectionConfig])],
  providers: [PageLayoutService],
  controllers: [PageLayoutController],
  exports: [PageLayoutService],
})
export class PageLayoutModule {}
