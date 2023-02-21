import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { BaseEntity } from "../../utils/dto.utils";
import { Transaction } from "../../transactions/entities/transaction.entity";
import { Category } from "../../categories/entities/category.entity";
import { Product } from "../../products/entities/product.entity";
import { Schedule } from "../../schedules/entities/schedule.entity";

@Entity("orders")
export class Order extends BaseEntity {
  @Column({ name: "created_date" })
  createdDate: Date;

  @Column({ name: "product_start_date" })
  productStartDate: Date;

  @OneToOne(() => Transaction, (transaction) => transaction.order)
  transaction: Transaction;

  @Column({ default: 0 })
  guests: number;

  @Column({ default: "" })
  comment: string;

  @OneToOne(() => Schedule, (schedule) => schedule.order)
  schedule: Schedule;

  @ManyToOne(() => Category, (category) => category.orders)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @ManyToOne(() => Product, (product) => product.orders)
  product: Product;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user: User;
}
