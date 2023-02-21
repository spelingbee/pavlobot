import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import axios from "axios";
import * as process from "process";
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.listen(8443);
  setInterval(() => {
    axios({
      method: "GET",
      url: process.env.API_URL
    })
  }, 10000)
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
