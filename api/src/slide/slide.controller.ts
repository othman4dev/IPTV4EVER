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
import { SlideService } from "./slide.service";
import { CreateSlideDto } from "./dto/create-slide.dto";
import { UpdateSlideDto } from "./dto/update-slide.dto";

@Controller("slides")
export class SlideController {
  constructor(private readonly slideService: SlideService) {}

  @Post()
  create(@Body() dto: CreateSlideDto) {
    return this.slideService.create(dto);
  }

  @Get()
  findAll() {
    return this.slideService.findAll();
  }

  @Get("active")
  findActive() {
    return this.slideService.findActive();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.slideService.findOne(id);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateSlideDto) {
    return this.slideService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.slideService.remove(id);
  }
}
