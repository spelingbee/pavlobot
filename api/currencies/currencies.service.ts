import { Injectable } from "@nestjs/common";
import { CreateCurrencyDto } from "./dto/create-currency.dto";
import { UpdateCurrencyDto } from "./dto/update-currency.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Currency } from "./entities/currency.entity";
import { Repository } from "typeorm";

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private currenciesRepository: Repository<Currency>
  ) {}
  async create(createCurrencyDto: CreateCurrencyDto) {
    const currency = await this.currenciesRepository.create(createCurrencyDto);
    return await this.currenciesRepository.save(currency);
  }

  async findAll() {
    return await this.currenciesRepository.find({
      where: {
        isShow: true,
      },
    });
  }

  async findOne(shortName: string, relations = []) {
    return await this.currenciesRepository.findOne({
      where: {
        shortName: shortName,
      },
      relations,
    });
  }

  async update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
    return await this.currenciesRepository.update(
      {
        id,
      },
      updateCurrencyDto
    );
  }

  remove(id: number) {
    return `This action removes a #${id} currency`;
  }
}
