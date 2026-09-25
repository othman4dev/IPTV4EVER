import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import * as express from "express";
import { join } from "path";

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
      "http://localhost:5173",
      "https://iptv4ever.com",
      "https://www.iptv4ever.com",
    ],
    credentials: true,
  });

  // Serve static files from uploads directory
  app.use(
    "/uploads",
    (
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(join(__dirname, "..", "uploads")),
  );

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`🚀 API Server running on http://localhost:${port}`);
}

bootstrap();
