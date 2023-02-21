import { BaseEntity } from "../../utils/dto.utils";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { TypeEnum } from "../enums/type.enum";
import { Currency } from "../../currencies/entities/currency.entity";
@Entity("transactions")
export class Transaction extends BaseEntity {
  @Column({ type: "enum", enum: TypeEnum })
  type: TypeEnum;

  @Column({ type: "float8" })
  amount: number;

  @Column({ name: "created_date" })
  createdDate: Date;

  @Column({ name: "payment_date" })
  paymentDate: Date;

  @Column({ type: "float8" })
  fee: number;

  @OneToOne(() => Order, (order) => order.transaction)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Currency, (currency) => currency.transactions)
  @JoinColumn({ name: "currency_id" })
  currency: Currency;
}
