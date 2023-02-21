import { IsBoolean, IsString } from "class-validator";

export class CreateCurrencyDto {
  @IsString()
  shortName: string;

  @IsString()
  name: string;

  @IsBoolean()
  isShow: boolean;
}
