import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { SchedulesService } from "./schedules.service";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";

@Controller("schedules")
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post("/create")
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Post("/addCron")
  createCron(@Body() createCron: { name: string; seconds: string }) {
    return this.schedulesService.addCronJob(
      createCron.name,
      createCron.seconds
    );
  }
  @Get("/closed/:categoryId")
  getDisabledDates(@Param("categoryId") categoryId: string) {
    return this.schedulesService.getClosedDates(+categoryId);
  }

  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.schedulesService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateScheduleDto: UpdateScheduleDto
  ) {
    return this.schedulesService.update(+id, updateScheduleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.schedulesService.remove(+id);
  }
}
