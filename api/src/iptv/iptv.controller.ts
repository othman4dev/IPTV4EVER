import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IptvService } from './iptv.service';

@Controller('iptv')
export class IptvController {
  constructor(private readonly iptvService: IptvService) {}

  @Get('channels')
  getChannels() {
    return this.iptvService.getChannels();
  }

  @Get('channels/:id')
  getChannel(@Param('id') id: string) {
    return this.iptvService.getChannel(id);
  }

  @Get('categories')
  getCategories() {
    return this.iptvService.getCategories();
  }

  @Post('playlist')
  createPlaylist(@Body() playlistData: any) {
    return this.iptvService.createPlaylist(playlistData);
  }
}
