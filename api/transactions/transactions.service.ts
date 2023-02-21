import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { Repository } from "typeorm";
import { Order } from "../orders/entities/order.entity";
import { OrdersService } from "../orders/orders.service";
import { CurrenciesService } from "../currencies/currencies.service";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    private currenciesService: CurrenciesService
  ) {}
  async create(createTransactionDto: CreateTransactionDto) {
    const order = await this.ordersService.findOne(
      createTransactionDto.orderId || -10
    );
    const currency = await this.currenciesService.findOne(
      createTransactionDto.currencyShortName
    );
    const transaction = await this.transactionRepository.create({
      ...createTransactionDto,
      currency,
      order,
    });
    return await this.transactionRepository.save(transaction);
  }

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    const order = await this.ordersService.findOne(
      updateTransactionDto.orderId
    );
    return await this.transactionRepository.update(
      { id },
      {
        ...updateTransactionDto,
        order,
      }
    );
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
