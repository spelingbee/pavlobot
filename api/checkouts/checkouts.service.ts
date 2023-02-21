import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { UpdateCheckoutDto } from "./dto/update-checkout.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { Between, LessThan, MoreThan, Not, Repository } from "typeorm";
import { Checkout } from "./entities/checkout.entity";
import { Category } from "../categories/entities/category.entity";
import { SchedulerRegistry } from "@nestjs/schedule";
import { MyLogger } from "../logger/logger.service";
import { bot } from "../main";
import dayjs from "dayjs";
import * as process from "process";
import { CurrenciesService } from "../currencies/currencies.service";
import { PayCheckoutDto } from "./dto/pay-checkout.dto";
import { Schedule } from "../schedules/entities/schedule.entity";
import { getDate } from "../utils/getDate";
import { getProductInfo } from "../utils/getProductInfo";
import axios from "axios";
import { Order } from "../orders/entities/order.entity";
import { TypeEnum } from "../transactions/enums/type.enum";
import { getRules } from "../utils/getRules";
import { StatusEnum } from "../users/enums/status.enum";
import { OrdersService } from "../orders/orders.service";

@Injectable()
export class CheckoutsService {
  constructor(
    @InjectRepository(Checkout)
    public checkoutsRepository: Repository<Checkout>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    private schedulerRegistry: SchedulerRegistry,
    private currenciesService: CurrenciesService,
    private ordersService: OrdersService,
    private logger: MyLogger
  ) {
    this.logger.setContext("Checkouts Service");
  }
  async create(createCheckoutDto: CreateCheckoutDto) {
    try {
      const category = await this.categoriesRepository.findOne({
        where: {
          id: createCheckoutDto.categoryId,
        },
        relations: {
          category: true,
        },
      });
      const startTime = new Date(createCheckoutDto.productStartDate);
      const endTime = new Date(
        +new Date(createCheckoutDto.productStartDate) +
          +category.durationInMilliseconds
      );
      const schedules = await this.schedulesRepository.find({
        where: [
          {
            startTime: Between(startTime, endTime),
            category: {
              office: {
                id: category.office?.id,
              },
            },
          },
          {
            endTime: Between(startTime, endTime),
            category: {
              office: {
                id: category.office?.id,
              },
            },
          },
        ],
      });
      if (schedules.length) {
        throw new BadRequestException("Эта дата занята");
      }
      const user = await this.usersRepository.findOne({
        where: {
          id: createCheckoutDto.userId,
        },
        relations: {
          checkout: true,
        },
      });
      const currency = await this.currenciesService.findOne(
        createCheckoutDto.currency,
        ["transactions"]
      );
      if (user.checkout) {
        await this.checkoutsRepository.delete({
          id: user.checkout.id,
        });
        this.logger.warn(
          `При создании заявки пользователю ${user.username}, была удалена прошлая заявка`
        );
      }
      let link;
      if (createCheckoutDto.currency === "TON") {
        link = new URL(
          "https://app.tonkeeper.com/transfer/" + process.env.TON_WALLET
        );
        link.searchParams.set(
          "amount",
          Math.ceil(createCheckoutDto.price * 1000000000)
        );
        link.searchParams.set(
          "text",
          `Rent ${category.category.name} for ${dayjs(
            createCheckoutDto.productStartDate
          ).format("DD.MM.YYYY at HH:mm")}. Receipt: #`
        );
      } else if (createCheckoutDto.currency === "IDR") {
        link = process.env.API_URL + "/checkout/pay/IDR";
      }
      const checkout = await this.checkoutsRepository.create({
        ...createCheckoutDto,
        currency,
        user,
        category,
        createdDate: getDate(),
      });
      const savedCheckout = await this.checkoutsRepository.save(checkout);
      if (createCheckoutDto.currency === "TON") {
        link.searchParams.set(
          "text",
          link.searchParams.get("text") + savedCheckout.id
        );
        link = link.href;
      } else if (createCheckoutDto.currency === "IDR") {
        const admins = await this.usersRepository.find({
          where: {
            isAdmin: true,
            id: Not(user.id),
            notifications: true,
          },
        });
        for (const admin of admins) {
          const endTime = new Date(
            +new Date(savedCheckout.productStartDate) +
              +category.durationInMilliseconds
          );
          await bot.api.sendMessage(
            admin.id,
            "Была сделана заявка, вот информация:\n" +
              getProductInfo({
                startTime: new Date(savedCheckout.productStartDate),
                endTime: endTime,
                name: category.name,
                descriptionActive: category.descriptionActive,
                description: category.description,
                address: category.address,
                price: `${savedCheckout.price.toFixed()} ${currency.shortName}`,
              }) +
              `Метод оплаты: ${currency.paymentMethod}\n` +
              "Пользователь: @" +
              user.username,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Чек",
                      web_app: {
                        url:
                          process.env.BOT_URL + "/receipt/" + savedCheckout.id,
                      },
                    },
                    {
                      text: "Подтвердить",
                      callback_data: "confirm1#" + savedCheckout.id,
                    },
                  ],
                ],
              },
            }
          );
        }
      }

      return await this.checkoutsRepository.save({
        ...savedCheckout,
        payLink: link,
      });
    } catch (e) {
      if (e.response) {
        this.logger.error(e.response.data?.message || e.response);
      } else {
        this.logger.error(e);
      }
      throw e;
    }
  }

  async pay(payCheckoutDto: PayCheckoutDto, currency: string) {
    if (currency === "IDR") {
      const category = await this.categoriesRepository.findOne({
        where: {
          id: payCheckoutDto.categoryId,
        },
        relations: {
          category: true,
        },
      });
      await bot.api.sendMessage(
        payCheckoutDto.userId,
        getProductInfo({
          startTime: new Date(payCheckoutDto.productStartDate),
          endTime: new Date(
            +new Date(payCheckoutDto.productStartDate) +
              +category.durationInMilliseconds
          ),
          name: category.name,
          descriptionActive: category.descriptionActive,
          description: category.description,
          address: category.address,
          price: `${payCheckoutDto.price} IDR\n`,
        })
      );
      await bot.api.sendMessage(
        payCheckoutDto.userId,
        "Чтобы подтвердить бронирование сделайте \n" +
          "оплату по реквизитам указаным ниже:\n" +
          "\n" +
          "🏦 Permata Bank\n" +
          "🫶 Pavlo Voronyuk\n" +
          "\n" +
          "#️⃣ 0098-1111-9625\n" +
          "\n" +
          "Вы должны увидеть Имя и фамилию, \n" +
          "что будет означать что вы нашли верный аккаунт\n" +
          "\n" +
          "Только после этого осуществляйте перевод"
      );
    }
  }

  async warnCheckout(checkout: Checkout) {
    try {
      if (checkout.processed) {
        throw new BadRequestException(new Error("Эта заявка уже обработана"));
      }
      await bot.api.sendMessage(
        checkout.user.id,
        "Вы все еще не оплатили заявку.\n",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  web_app: {
                    url: process.env.BOT_URL + "/receipt/" + checkout.id,
                  },
                  text: "Оплатить",
                },
                {
                  callback_data: "delete checkout #" + checkout.id,
                  text: "Удалить заявку",
                },
              ],
            ],
          },
        }
      );
      this.logger.warn(
        `Предупреждение пользователю: ${checkout.user.username}. Заявка не оплачивается.`
      );
      return await this.checkoutsRepository.update(
        {
          id: checkout.id,
        },
        { processed: true }
      );
    } catch (error) {
      if (error.error_code === 400) {
        this.logger.error(
          "Пользователь скорее всего удалил чат с ботом, невозможно связаться с ним."
        );
      } else if (error.statusCode === 400) {
        this.logger.error(error.message);
        throw error;
      }
    }
  }
  async processCheckout(checkout: Checkout) {
    try {
      await this.checkoutsRepository.delete({
        id: checkout.id,
      });
      await bot.api.sendMessage(
        checkout.user.id,
        "Вы не оплатили резервацию офиса, заявка удалена"
      );
      this.logger.verbose(
        `Удален чек: id - ${checkout.id} username - ${checkout.user.username}`
      );
    } catch (error: any) {
      if (
        error.error_code == 400 &&
        error.description === "Bad Request: chat not found"
      ) {
        this.logger.error(
          "Данный пользователь либо удалил, либо не открывал его"
        );
      } else {
        this.logger.error(error);
      }
    }
  }
  async findAll() {
    return await this.checkoutsRepository.find();
  }

  async findOne(id: number, relations = []) {
    return await this.checkoutsRepository.findOne({
      where: {
        id,
      },
      relations,
    });
  }

  update(id: number, updateCheckoutDto: UpdateCheckoutDto) {
    return this.checkoutsRepository.update(
      {
        id,
      },
      updateCheckoutDto
    );
  }

  async remove(id: number) {
    return await this.checkoutsRepository.delete(id);
  }

  async checkPayments() {
    try {
      await bot.api.sendMessage(1096612971, "foo");
      const response = await axios({
        url:
          "https://toncenter.com/api/v2/getTransactions?address=" +
          process.env.TON_WALLET +
          "&limit=7",
        method: "GET",
      });
      const tonTransactions = response.data.result.map((item) => ({
        id: item.in_msg.message.split("#")[1],
        time: item.utime,
        fee: item.fee / 1000000000,
      }));
      const checkouts = await this.checkoutsRepository.find({
        relations: ["user", "category", "category.category", "currency"],
      });
      const paidCheckouts = checkouts.filter((checkout) => {
        return (
          checkout.paid ||
          tonTransactions.find(
            (item) =>
              item.id === checkout.id && checkout.currency.shortName === "TON"
          )
        );
      });
      for (const checkout of paidCheckouts) {
        const tonkeeperTransaction = tonTransactions.find(
          (item) => item.id === checkout.id
        );
        let order: Order;
        await this.remove(checkout.id);
        if (checkout.currency.shortName === "TON") {
          order = await this.ordersService.create({
            userId: checkout.user.id,
            categoryId: checkout.category.id,
            createdDate: getDate(),
            productStartDate: checkout.productStartDate,
            transaction: {
              type: TypeEnum.tonkeeper,
              createdDate: getDate(),
              amount: checkout.price,
              fee: tonkeeperTransaction.fee,
              currencyShortName: "TON",
              paymentDate: new Date(tonkeeperTransaction.time * 1000),
            },
          });
        } else {
          order = await this.ordersService.create({
            userId: checkout.user.id,
            categoryId: checkout.category.id,
            createdDate: getDate(),
            productStartDate: checkout.productStartDate,
            transaction: {
              type: TypeEnum.cash,
              createdDate: getDate(),
              amount: checkout.price,
              fee: checkout.fee || 0,
              currencyShortName: "IDR",
              paymentDate: getDate(),
            },
          });
        }
        await bot.api.sendPhoto(
          checkout.user.id,
          process.env.VERCEL_HOST +
            process.env.VERCEL_URL +
            "/img/" +
            checkout.category.img,
          {
            caption:
              "Спасибо большое за заказ, приходите еще, вот информация о вашей покупке: \n" +
              getProductInfo({
                startTime: new Date(order.schedule.startTime),
                endTime: new Date(order.schedule.endTime),
                name: order.category.name,
                descriptionActive: order.category.descriptionActive,
                description: order.category.description,
                address: order.category.address,
                price: `${order.transaction.amount.toFixed()} ${
                  order.transaction.currency.shortName
                }`,
              }),
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Checkout",
                    web_app: {
                      url: process.env.BOT_URL + "/checkout/" + order.id,
                    },
                  },
                ],
              ],
            },
          }
        );
        await bot.api.sendMessage(checkout.user.id, getRules());
        await this.usersRepository.update(
          {
            id: checkout.user.id,
          },
          {
            status: StatusEnum.booked,
          }
        );
      }
      const upPaidCheckouts = checkouts.filter(
        (checkout) => !tonTransactions.find((item) => item.id === checkout.id)
      );
      for (const upPaidCheckout of upPaidCheckouts) {
        const pastTime = +getDate() - +upPaidCheckout.createdDate;
        if (!upPaidCheckout.processed && pastTime >= 5400000) {
          await this.warnCheckout(upPaidCheckout);
        } else if (upPaidCheckout.processed && pastTime >= 7150000) {
          await this.processCheckout(upPaidCheckout);
        }
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response?.data || error.response);
      }
    }
  }
}
