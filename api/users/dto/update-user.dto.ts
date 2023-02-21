import { StatusEnum } from "../enums/status.enum";
import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  readonly lastName?: string;

  @IsString()
  @IsOptional()
  readonly userName?: string;

  @IsString()
  @IsOptional()
  readonly languageCode?: string;

  @IsString()
  @IsOptional()
  status?: StatusEnum;
}
