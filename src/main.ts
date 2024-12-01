import { join } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import flash from "connect-flash";
import session from "express-session";
import { AppModule } from "./app.module";
import config from "./config";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(flash());
  app.setBaseViewsDir(join(__dirname, "..", "views"));
  app.setViewEngine("ejs");
  app.useStaticAssets(join(__dirname, "..", "public"));
  app.enableShutdownHooks();
  app.set("etag", false);
  await app.listen(config.port);
}

void bootstrap();
