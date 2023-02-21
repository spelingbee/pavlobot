import { Injectable } from "@nestjs/common";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, MoreThan, Repository } from "typeorm";
import { Schedule } from "./entities/schedule.entity";
import { Order } from "../orders/entities/order.entity";
import { SchedulerRegistry } from "@nestjs/schedule";
import { MyLogger } from "../logger/logger.service";
import { CronJob } from "cron";
import { bot } from "../main";
import dayjs from "dayjs";
import { getDate } from "../utils/getDate";
import { InlineKeyboard } from "grammy";

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private schedulerRegistry: SchedulerRegistry,
    private logger: MyLogger
  ) {
    this.logger.setContext("Schedules Service");
  }
  async create(createScheduleDto: CreateScheduleDto) {
    const schedule = await this.schedulesRepository.create(createScheduleDto);
    schedule.order = await this.ordersRepository.findOne({
      where: {
        id: createScheduleDto.orderId,
      },
      relations: ["category", "user", "transaction", "transaction.currency"],
    });
    const inlineKeyboard = new InlineKeyboard().text(
      "Подробнее",
      `details1#${schedule.order.id}`
    );
    const leftTime = +createScheduleDto.startTime - +getDate();
    let duration;
    let cronPattern;
    if (leftTime > 910 * 1000) {
      cronPattern =
        "0" +
        dayjs(new Date(+createScheduleDto.startTime - 910 * 1000)).format(
          "mm H D M d"
        );
      this.addCronJob(
        `${schedule.order.user.username} start#${schedule.order.id}`,
        cronPattern,
        async () => {
          await bot.api.sendMessage(
            schedule.order.user.id,
            "Ваша аренда офиса придет в действие через 15 минут",
            {
              reply_markup: inlineKeyboard,
            }
          );
        }
      );
    } else if (leftTime > 1000) {
      const minutes = Math.floor(leftTime / 1000 / 60);
      duration = `${minutes} минут`;
      await bot.api.sendMessage(
        schedule.order.user.id,
        "Ваша аренда офиса придет в действие через " + duration,
        {
          reply_markup: inlineKeyboard,
        }
      );
    }
    this.logger.log(leftTime);
    this.addCronJob(
      `${schedule.order.user.username} end#${schedule.order.id}`,
      dayjs(+schedule.endTime - 900000).format("s m H D MMM d"),
      async () => {
        await bot.api.sendMessage(
          schedule.order.user.id,
          "Ваша аренда закончится через 15 минут",
          {
            reply_markup: inlineKeyboard,
          }
        );
        this.schedulerRegistry.deleteCronJob(
          `${schedule.order.user.username} end#${schedule.order.id}`
        );
        await this.schedulesRepository.delete(schedule.id);
      }
    );
    return await this.schedulesRepository.save(schedule);
  }

  addCronJob(
    name: string,
    pattern: string,
    cb = () => this.logger.error("Не передан callback")
  ) {
    const job = new CronJob(pattern, () => {
      cb();
      this.logger.verbose(`Успешно выполнена крон задача ${name}`);
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();
  }
  getCronJobs() {
    return this.schedulerRegistry.getCronJobs();
  }

  getCronJob(name: string) {
    return this.schedulerRegistry.getCronJob(name);
  }

  deleteCronJob(name: string) {
    return this.schedulerRegistry.deleteCronJob(name);
  }

  addTimeout(name: string, timeoutTime: number, cb) {
    const timeoutId = setTimeout(cb, timeoutTime);
    return this.schedulerRegistry.addTimeout(name, timeoutId);
  }

  findAll() {
    return `This action returns all schedules`;
  }
  findOne(id) {
    return `This action returns all schedules`;
  }

  async getClosedDates(categoryId: number) {
    const schedules = await this.schedulesRepository.find({
      where: {
        startTime: LessThan(getDate()),
        endTime: MoreThan(new Date(+getDate() - 3600 * 9 * 1000)),
      },
      relations: {
        category: true,
      },
    });
    return schedules;
  }

  update(id: number, updateScheduleDto: UpdateScheduleDto) {
    return `This action updates a #${id} schedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} schedule`;
  }
}
