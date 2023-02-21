import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";
import { UsersModule } from "./users/users.module";
import { OrdersModule } from "./orders/orders.module";
import { CheckoutsModule } from "./checkouts/checkouts.module";
import { CategoriesModule } from "./categories/categories.module";
import { ProductsModule } from "./products/products.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { SchedulesModule } from "./schedules/schedules.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";
import { resolve } from "path";
import { CurrenciesModule } from "./currencies/currencies.module";
import { MulterModule } from "@nestjs/platform-express";
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.${process.env.NODE_ENV}.env`],
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, "../client"),
    }),
    MulterModule.register({
      dest: resolve(__dirname, "../client"),
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST"),
        port: +configService.get<number>("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_NAME"),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    OrdersModule,
    CheckoutsModule,
    CategoriesModule,
    ProductsModule,
    TransactionsModule,
    SchedulesModule,
    CurrenciesModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService],
})
export class AppModule {}
