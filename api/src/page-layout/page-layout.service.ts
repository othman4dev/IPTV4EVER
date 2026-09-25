import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdatePageLayoutDto } from "./dto/update-page-layout.dto";
import { PageSectionConfig } from "./page-section-config.entity";

const DEFAULT_HOME_SECTIONS: Omit<PageSectionConfig, "id">[] = [
  {
    page: "home",
    sectionKey: "hero",
    label: "Hero Section",
    icon: "bi-window-stack",
    order: 0,
    isVisible: true,
    variant: "default",
    config: "{}",
  },
  {
    page: "home",
    sectionKey: "announcements",
    label: "Announcements",
    icon: "bi-megaphone",
    order: 1,
    isVisible: true,
    variant: "default",
    config: "{}",
  },
  {
    page: "home",
    sectionKey: "intro",
    label: "Features / Intro",
    icon: "bi-grid-3x3-gap",
    order: 2,
    isVisible: true,
    variant: "default",
    config: "{}",
  },
  {
    page: "home",
    sectionKey: "slider",
    label: "Channel Slider",
    icon: "bi-images",
    order: 3,
    isVisible: true,
    variant: "default",
    config: "{}",
  },
  {
    page: "home",
    sectionKey: "testimonials",
    label: "Testimonials",
    icon: "bi-chat-square-quote",
    order: 4,
    isVisible: true,
    variant: "default",
    config: "{}",
  },
  {
    page: "home",
    sectionKey: "pricing",
    label: "Pricing Plans",
    icon: "bi-list-check",
    order: 5,
    isVisible: true,
    variant: "default",
    config: "{}",
  },
  {
    page: "home",
    sectionKey: "faq",
    label: "FAQ",
    icon: "bi-question-circle",
    order: 6,
    isVisible: true,
    variant: "default",
    config: "{}",
  },
  {
    page: "home",
    sectionKey: "contact",
    label: "Contact Us",
    icon: "bi-envelope",
    order: 7,
    isVisible: true,
    variant: "default",
    config: "{}",
  },
];

@Injectable()
export class PageLayoutService {
  constructor(
    @InjectRepository(PageSectionConfig)
    private readonly repo: Repository<PageSectionConfig>,
  ) {}

  async getHomeSections(): Promise<PageSectionConfig[]> {
    const existing = await this.repo.find({
      where: { page: "home" },
      order: { order: "ASC" },
    });

    if (existing.length === 0) {
      const records = this.repo.create(DEFAULT_HOME_SECTIONS);
      await this.repo.save(records);
      return this.repo.find({
        where: { page: "home" },
        order: { order: "ASC" },
      });
    }

    return existing;
  }

  async updateHomeSections(
    dto: UpdatePageLayoutDto,
  ): Promise<PageSectionConfig[]> {
    const existing = await this.repo.find({ where: { page: "home" } });
    const existingMap = new Map(existing.map((s) => [s.sectionKey, s]));

    for (const item of dto.sections) {
      const record = existingMap.get(item.sectionKey);
      if (record) {
        record.isVisible = item.isVisible;
        record.order = item.order;
        if (item.variant !== undefined) {
          record.variant = item.variant;
        }
        if (item.config !== undefined) {
          record.config = item.config;
        }
        await this.repo.save(record);
      }
    }

    return this.repo.find({ where: { page: "home" }, order: { order: "ASC" } });
  }

  async getSectionByKey(sectionKey: string): Promise<PageSectionConfig | null> {
    return this.repo.findOne({ where: { page: "home", sectionKey } }) ?? null;
  }

  async patchSection(
    sectionKey: string,
    config?: string,
    variant?: string,
  ): Promise<PageSectionConfig | null> {
    const record = await this.repo.findOne({
      where: { page: "home", sectionKey },
    });
    if (!record) return null;
    if (config !== undefined) record.config = config;
    if (variant !== undefined) record.variant = variant;
    return this.repo.save(record);
  }
}
