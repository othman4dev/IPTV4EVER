import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { BlogService } from "./blog.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

@Controller("blogs")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() dto: CreateBlogDto) {
    return this.blogService.create(dto);
  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get("published")
  findPublished() {
    return this.blogService.findPublished();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.findOne(id);
  }

  @Put(":id")
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateBlogDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.remove(id);
  }
}
