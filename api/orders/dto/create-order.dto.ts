import { IsNotEmpty, IsNumber, ValidateNested } from "class-validator";
import { CreateTransactionDto } from "../../transactions/dto/create-transaction.dto";
import { Type } from "class-transformer";

export class CreateOrderDto {
  @IsNotEmpty()
  createdDate: Date;

  @IsNotEmpty()
  productStartDate: Date;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNumber()
  categoryId: number;

  @Type(() => CreateTransactionDto)
  @ValidateNested()
  transaction: CreateTransactionDto;
}
