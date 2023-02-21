import { forwardRef, Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { CategoriesModule } from "../categories/categories.module";
import { SchedulesModule } from "../schedules/schedules.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { UsersModule } from "../users/users.module";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User]),
    forwardRef(() => CategoriesModule),
    forwardRef(() => TransactionsModule),
    forwardRef(() => SchedulesModule),
    UsersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
