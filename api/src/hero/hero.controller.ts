import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";
import { HeroService } from "./hero.service";
import { CreateHeroDto } from "./dto/create-hero.dto";
import { UpdateHeroDto } from "./dto/update-hero.dto";

@Controller("heroes")
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Post()
  create(@Body() dto: CreateHeroDto) {
    return this.heroService.create(dto);
  }

  @Get()
  findAll() {
    return this.heroService.findAll();
  }

  @Get("active")
  findActive() {
    return this.heroService.findActive();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.heroService.findOne(id);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateHeroDto) {
    return this.heroService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.heroService.remove(id);
  }
}
