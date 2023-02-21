import { Injectable } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { Not, Repository } from "typeorm";
import { CategoriesService } from "../categories/categories.service";
import { TransactionsService } from "../transactions/transactions.service";
import { UsersService } from "../users/users.service";
import { SchedulesService } from "../schedules/schedules.service";
import { User } from "../users/entities/user.entity";
import { bot } from "../main";
import * as process from "process";
import { getProductInfo } from "../utils/getProductInfo";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService,
    private usersService: UsersService,
    private schedulesService: SchedulesService
  ) {}
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const transaction = await this.transactionsService.create(
        createOrderDto.transaction
      );
      const category = await this.categoriesService.findOne(
        createOrderDto.categoryId
      );
      const user = await this.usersService.findOne(createOrderDto.userId);
      const order = await this.ordersRepository.create({
        ...createOrderDto,
        transaction,
        category,
        user,
      });
      const savedOrder = await this.ordersRepository.save(order);
      const admins = await this.usersRepository.find({
        where: {
          isAdmin: true,
          id: Not(savedOrder.id),
          notifications: true,
        },
      });
      const endTime = new Date(
        +new Date(savedOrder.productStartDate) +
          +category.durationInMilliseconds
      );
      for (const admin of admins) {
        await bot.api.sendMessage(
          admin.id,
          "Был сделан заказ, вот информация:\n" +
            getProductInfo({
              startTime: new Date(savedOrder.productStartDate),
              endTime: endTime,
              name: category.name,
              descriptionActive: category.descriptionActive,
              description: category.description,
              address: category.address,
              price: `${order.transaction.amount.toFixed()} ${
                order.transaction.currency.shortName
              }`,
            }) +
            `Метод оплаты: ${transaction.currency.paymentMethod}\n` +
            "Пользователь: @" +
            user.username,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Чек",
                    web_app: {
                      url: process.env.BOT_URL + "/checkout/" + savedOrder.id,
                    },
                  },
                ],
              ],
            },
          }
        );
      }
      const schedule = await this.schedulesService.create({
        orderId: savedOrder.id,
        categoryId: category.id,
        startTime: savedOrder.productStartDate,
        endTime,
      });
      return await this.ordersRepository.save({
        ...savedOrder,
        schedule,
      });
    } catch (error) {}
  }

  findAll() {
    return `This action returns all orders`;
  }

  async findOne(id: number, relations = []) {
    return await this.ordersRepository.findOne({
      where: {
        id,
      },
      relations,
    });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
