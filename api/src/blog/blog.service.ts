import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Blog } from "./blog.entity";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
  ) {}

  async create(dto: CreateBlogDto): Promise<Blog> {
    const blog = this.blogRepo.create({
      ...dto,
      media: dto.media ?? [],
    });
    return this.blogRepo.save(blog);
  }

  async findAll(): Promise<Blog[]> {
    const blogs = await this.blogRepo.find({
      order: { order: "ASC", createdAt: "DESC" },
    });
    return blogs.map((b) => ({ ...b, media: b.media ?? [] }));
  }

  async findPublished(): Promise<Blog[]> {
    const blogs = await this.blogRepo.find({
      where: { isPublished: true },
      order: { order: "ASC", createdAt: "DESC" },
    });
    return blogs.map((b) => ({ ...b, media: b.media ?? [] }));
  }

  async findOne(id: number): Promise<Blog> {
    const blog = await this.blogRepo.findOne({ where: { id } });
    if (!blog) throw new NotFoundException(`Blog #${id} not found`);
    return blog;
  }

  async update(id: number, dto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.findOne(id);
    Object.assign(blog, dto);
    return this.blogRepo.save(blog);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.blogRepo.delete(id);
  }
}
