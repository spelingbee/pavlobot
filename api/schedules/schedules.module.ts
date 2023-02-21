import { forwardRef, Module } from "@nestjs/common";
import { SchedulesService } from "./schedules.service";
import { SchedulesController } from "./schedules.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Schedule } from "./entities/schedule.entity";
import { Order } from "../orders/entities/order.entity";
import { LoggerModule } from "../logger/logger.module";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, Order]),
    LoggerModule,
    forwardRef(() => OrdersModule),
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
