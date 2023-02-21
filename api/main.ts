import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MyLogger } from "./logger/logger.service";
import { CheckoutsService } from "./checkouts/checkouts.service";
import { Bot } from "grammy";
import axios from "axios";
import { OrdersService } from "./orders/orders.service";
import { UsersService } from "./users/users.service";
import { StatusEnum } from "./users/enums/status.enum";
import { ValidationPipe } from "@nestjs/common";
import { TypeEnum } from "./transactions/enums/type.enum";
import { getDate } from "./utils/getDate";
import { Order } from "./orders/entities/order.entity";
import { AuthGuard } from "./auth/auth.guard";
import { getProductInfo } from "./utils/getProductInfo";
import { getRules } from "./utils/getRules";
import * as process from "process";
import { SchedulesService } from "./schedules/schedules.service";
import dayjs from "dayjs";

const myBot = new Bot(process.env.BOT_TOKEN);
myBot.hears("Айжан", async (ctx) => {
  await ctx.reply("Самая красивая девушка на свете, и самая лучшая");
});

export const services = {
  checkoutsService: ({} as CheckoutsService) || null,
  ordersService: ({} as OrdersService) || null,
  usersService: ({} as UsersService) || null,
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    cors: {
      origin: "*",
      methods: ["POST", "PUT", "DELETE", "GET", "OPTIONS", "PATCH"],
      allowedHeaders: [
        "X-Requested-With",
        "X-HTTP-Method-Override",
        "Content-Type",
        "Accept",
        "Observe",
        "X-XSRF-TOKEN",
        "*",
      ],
    },
  });
  app.useGlobalGuards(new AuthGuard());
  app.useGlobalPipes(new ValidationPipe());
  const checkoutsService: CheckoutsService = app.get(CheckoutsService);
  const ordersService: OrdersService = app.get(OrdersService);
  const schedulesService: SchedulesService = app.get(SchedulesService);
  const usersService: UsersService = app.get(UsersService);
  services.checkoutsService = checkoutsService;
  services.ordersService = ordersService;

  app.useLogger(new MyLogger());
  const config = new DocumentBuilder()
    .setTitle("Books Office")
    .setDescription("The Books Office API description")
    .setVersion("1.0")
    .addTag("books")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  await app.listen(8443);
  // #TODO delete bot start command
  console.log(`Application is running on: ${await app.getUrl()}`);
}
export const bot = myBot;
bootstrap();
