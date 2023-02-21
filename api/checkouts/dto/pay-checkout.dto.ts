import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PayCheckoutDto {
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  productStartDate: Date;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
