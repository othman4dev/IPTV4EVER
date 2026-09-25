import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Endpoint } from "./endpoint.entity";
import { EndpointService } from "./endpoint.service";
import { EndpointController } from "./endpoint.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Endpoint])],
  providers: [EndpointService],
  controllers: [EndpointController],
  exports: [EndpointService],
})
export class EndpointModule {}
