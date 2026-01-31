import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "https://hotiptvman.com",
      "https://www.hotiptvman.com",
    ],
    credentials: true,
  });

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`🚀 API Server running on http://localhost:${port}`);
}

bootstrap();
