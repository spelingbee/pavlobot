import { Module } from "@nestjs/common";
import { CheckoutsService } from "./checkouts.service";
import { CheckoutsController } from "./checkouts.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Checkout } from "./entities/checkout.entity";
import { User } from "../users/entities/user.entity";
import { Category } from "../categories/entities/category.entity";
import { LoggerModule } from "../logger/logger.module";
import { CurrenciesModule } from "../currencies/currencies.module";
import { Schedule } from "../schedules/entities/schedule.entity";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Checkout, User, Category, Schedule]),
    LoggerModule,
    CurrenciesModule,
    OrdersModule,
  ],
  controllers: [CheckoutsController],
  providers: [CheckoutsService],
  exports: [TypeOrmModule],
})
export class CheckoutsModule {}
