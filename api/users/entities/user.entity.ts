import { Entity, Column, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { Checkout } from "../../checkouts/entities/checkout.entity";
import { StatusEnum } from "../enums/status.enum";

@Entity("users")
export class User {
  @PrimaryColumn({ type: "int8" })
  id: number;

  @Column({ name: "bot_id", type: "int8" })
  botId: number;

  @Column({ default: "started", enum: StatusEnum })
  status: StatusEnum;

  @Column({ name: "is_admin", default: false })
  isAdmin: boolean;

  @Column({ default: false })
  notifications: boolean;

  @Column({ name: "first_name", nullable: true })
  firstName: string;

  @Column({ name: "last_name", nullable: true })
  lastName: string;

  @Column({ unique: true })
  username: string;

  @Column({ name: "language_code" })
  languageCode: string;

  @OneToOne(() => Checkout, (checkout) => checkout.user)
  checkout: Checkout;

  @OneToMany(() => Order, (orders) => orders.user)
  orders: Order[];
}
