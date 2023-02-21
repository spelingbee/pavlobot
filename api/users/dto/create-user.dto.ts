import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @IsNumber()
  readonly id: number;

  @IsString()
  @IsOptional()
  readonly firstName?: string | null | undefined;

  @IsString()
  @IsOptional()
  readonly lastName?: string | null | undefined;
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  readonly languageCode: string;

  @IsNumber()
  @IsNotEmpty()
  readonly botId: number;
}
