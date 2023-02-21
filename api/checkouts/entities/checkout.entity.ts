import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { BaseEntity } from "../../utils/dto.utils";
import { Category } from "../../categories/entities/category.entity";
import { Currency } from "../../currencies/entities/currency.entity";

@Entity("checkouts")
export class Checkout extends BaseEntity {
  @Column({ default: false })
  processed: boolean;

  @Column({ name: "created_date" })
  createdDate: Date;

  @Column()
  guests: number;

  @Column()
  comment: string;

  @Column({ type: "float8" })
  price: number;

  @Column({ name: "pay_link", nullable: true })
  payLink: string;

  @Column({ name: "product_start_date" })
  productStartDate: Date;

  @Column({ default: false })
  paid: boolean;

  @Column({ type: "float8", nullable: true })
  fee: number;

  @OneToOne(() => User, (user) => user.checkout)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Category, (category) => category.checkouts)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @ManyToOne(() => Currency, (currency) => currency.checkouts)
  @JoinColumn({ name: "currency_id" })
  currency: Currency;
}
