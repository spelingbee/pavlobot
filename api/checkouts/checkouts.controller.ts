import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { CheckoutsService } from "./checkouts.service";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { UpdateCheckoutDto } from "./dto/update-checkout.dto";
import { PayCheckoutDto } from "./dto/pay-checkout.dto";
@Controller("checkouts")
export class CheckoutsController {
  constructor(private readonly checkoutsService: CheckoutsService) {}

  @Post("/create")
  create(@Body() createCheckoutDto: CreateCheckoutDto) {
    return this.checkoutsService.create(createCheckoutDto);
  }

  @Post("/pay/:currency")
  pay(
    @Param("currency") currency: string,
    @Body() payCheckoutDto: PayCheckoutDto
  ) {
    return this.checkoutsService.pay(payCheckoutDto, currency);
  }
  @Post("/check")
  check() {
    return this.checkoutsService.checkPayments();
  }

  @Get()
  findAll() {
    return this.checkoutsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Query("relations") relations: string) {
    if (!relations) {
      relations = JSON.stringify([]);
    }
    return this.checkoutsService.findOne(+id, JSON.parse(relations));
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCheckoutDto: UpdateCheckoutDto
  ) {
    return this.checkoutsService.update(+id, updateCheckoutDto);
  }
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.checkoutsService.remove(+id);
  }
}
