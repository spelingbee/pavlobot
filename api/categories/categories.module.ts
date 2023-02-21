import { forwardRef, Module } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CategoriesController } from "./categories.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { Product } from "../products/entities/product.entity";
import { Order } from "../orders/entities/order.entity";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product, Order]),
    forwardRef(() => OrdersModule),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
