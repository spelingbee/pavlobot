import { forwardRef, Module } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { TransactionsController } from "./transactions.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { OrdersModule } from "../orders/orders.module";
import { CurrenciesModule } from "../currencies/currencies.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    forwardRef(() => OrdersModule),
    CurrenciesModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
