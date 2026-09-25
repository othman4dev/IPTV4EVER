import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import { EndpointService } from "./endpoint.service";
import { CreateEndpointDto } from "./dto/create-endpoint.dto";
import { UpdateEndpointDto } from "./dto/update-endpoint.dto";

@Controller("endpoints")
export class EndpointController {
  constructor(private readonly endpointService: EndpointService) {}

  @Post()
  create(@Body() dto: CreateEndpointDto) {
    return this.endpointService.create(dto);
  }

  @Get()
  findAll() {
    return this.endpointService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.endpointService.findOne(id);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateEndpointDto,
  ) {
    return this.endpointService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.endpointService.remove(id);
  }
}
