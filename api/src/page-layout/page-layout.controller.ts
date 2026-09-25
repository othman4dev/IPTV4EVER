import { Body, Controller, Get, Param, Patch, Put } from "@nestjs/common";
import { UpdatePageLayoutDto } from "./dto/update-page-layout.dto";
import { PageLayoutService } from "./page-layout.service";

@Controller("page-layout")
export class PageLayoutController {
  constructor(private readonly pageLayoutService: PageLayoutService) {}

  @Get("home")
  getHome() {
    return this.pageLayoutService.getHomeSections();
  }

  @Get("home/section/:key")
  getSection(@Param("key") key: string) {
    return this.pageLayoutService.getSectionByKey(key);
  }

  @Put("home")
  updateHome(@Body() dto: UpdatePageLayoutDto) {
    return this.pageLayoutService.updateHomeSections(dto);
  }

  @Patch("home/section/:key")
  patchSection(
    @Param("key") key: string,
    @Body() body: { config?: string; variant?: string },
  ) {
    return this.pageLayoutService.patchSection(key, body.config, body.variant);
  }
}
