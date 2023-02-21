import { TypeEnum } from "../enums/type.enum";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateTransactionDto {
  @IsEnum(TypeEnum)
  readonly type: TypeEnum;

  @IsNumber()
  readonly amount: number;

  @IsNotEmpty()
  readonly createdDate: Date;

  @IsNotEmpty()
  readonly paymentDate: Date;

  @IsNumber()
  readonly fee: number;

  @IsNumber()
  @IsOptional()
  readonly orderId?: number;

  @IsString()
  @IsNotEmpty()
  readonly currencyShortName: string;
}
