import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

export class CreateCheckoutDto {
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsString()
  comment: string;

  @IsNumber()
  guests: number;

  @IsNotEmpty()
  productStartDate: Date;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;
}
