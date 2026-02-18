import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "https://iptv4ever.com",
      "https://www.iptv4ever.com",
    ],
    credentials: true,
  });

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`🚀 API Server running on http://localhost:${port}`);
}

bootstrap();
