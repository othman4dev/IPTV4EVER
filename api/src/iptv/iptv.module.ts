import { Module } from '@nestjs/common';
import { IptvController } from './iptv.controller';
import { IptvService } from './iptv.service';

@Module({
  controllers: [IptvController],
  providers: [IptvService],
})
export class IptvModule {}
