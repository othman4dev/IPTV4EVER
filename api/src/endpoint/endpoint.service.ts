import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Endpoint } from "./endpoint.entity";
import { CreateEndpointDto } from "./dto/create-endpoint.dto";
import { UpdateEndpointDto } from "./dto/update-endpoint.dto";

@Injectable()
export class EndpointService {
  constructor(
    @InjectRepository(Endpoint)
    private readonly endpointRepo: Repository<Endpoint>,
  ) {}

  async create(dto: CreateEndpointDto): Promise<Endpoint> {
    const endpoint = this.endpointRepo.create({
      ...dto,
      playlistName: "iptv4ever",
    });
    return this.endpointRepo.save(endpoint);
  }

  async findAll(): Promise<Endpoint[]> {
    return this.endpointRepo.find({
      order: { id: "DESC" },
    });
  }

  async findOne(id: number): Promise<Endpoint> {
    const endpoint = await this.endpointRepo.findOne({ where: { id } });
    if (!endpoint) {
      throw new NotFoundException("Endpoint not found");
    }
    return endpoint;
  }

  async update(id: number, dto: UpdateEndpointDto): Promise<Endpoint> {
    const endpoint = await this.findOne(id);
    Object.assign(endpoint, dto, { playlistName: "iptv4ever" });
    return this.endpointRepo.save(endpoint);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.endpointRepo.delete(id);
  }
}
