import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { PlanModule } from "./plan/plan.module";
import { PlanFeatureModule } from "./plan-feature/plan-feature.module";
import { UserModule } from "./user/user.module";
import { ChatModule } from "./chat/chat.module";
import { AnnouncementModule } from "./announcement/announcement.module";
import { SlideModule } from "./slide/slide.module";
import { HeroModule } from "./hero/hero.module";
import { EndpointModule } from "./endpoint/endpoint.module";
import { UploadModule } from "./upload/upload.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { BlogModule } from "./blog/blog.module";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "mysql",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306"),
        username: process.env.DB_USERNAME || "iptv4ever_user",
        password: process.env.DB_PASSWORD || "iptv4ever_pass_2026",
        database: process.env.DB_DATABASE || "iptv4ever_db",
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: process.env.NODE_ENV !== "production",
        logging: process.env.NODE_ENV === "development",
      }),
    }),
    AuthModule,
    PlanModule,
    PlanFeatureModule,
    UserModule,
    ChatModule,
    AnnouncementModule,
    SlideModule,
    HeroModule,
    EndpointModule,
    UploadModule,
    SubscriptionModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
