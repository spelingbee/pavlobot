import { Coordinates } from "../../utils/types/coordinates";
import {
  IsArray,
  IsBoolean,
  IsJSON,
  isNumber,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Nullable } from "../../utils/validators/nullable.validator";

export class CreateCategoryDto {
  @IsString()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsString()
  readonly type: string;

  @IsBoolean()
  readonly descriptionActive: boolean;

  @Nullable()
  @IsNumber()
  @IsOptional()
  readonly duration?: number;

  @IsNumber()
  @IsOptional()
  readonly initialPrice?: number;

  @IsJSON()
  @IsOptional()
  readonly coordinates?: Coordinates;

  @IsString()
  @IsOptional()
  readonly address?: string;

  @IsArray()
  @IsOptional()
  readonly ordersId?: number[];

  @IsArray()
  @IsOptional()
  categoriesId?: number[];

  @IsArray()
  @IsOptional()
  readonly productsId?: number[];

  @IsNumber()
  @IsOptional()
  readonly categoryId?: number;

  @IsNumber()
  @IsOptional()
  readonly productId?: number;

  @IsBoolean()
  readonly isProduct: boolean;

  @IsBoolean()
  readonly isActive: boolean;

  @IsBoolean()
  readonly isPeriod: boolean;

  @IsBoolean()
  readonly isOffice: boolean;
}
