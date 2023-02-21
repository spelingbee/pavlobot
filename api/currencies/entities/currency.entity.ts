import { BaseEntity } from "../../utils/dto.utils";
import { Column, Entity, OneToMany } from "typeorm";
import { Transaction } from "../../transactions/entities/transaction.entity";
import { Checkout } from "../../checkouts/entities/checkout.entity";
import { TypeEnum } from "../../transactions/enums/type.enum";

@Entity("currencies")
export class Currency extends BaseEntity {
  @Column({ name: "short_name" })
  shortName: string;

  @Column()
  name: string;

  @Column({ name: "is_show", default: true })
  isShow: boolean;

  @Column({
    name: "payment_method",
    default: TypeEnum.cash,
    type: "enum",
    enum: TypeEnum,
  })
  paymentMethod: TypeEnum;

  @OneToMany(() => Transaction, (transactions) => transactions.currency)
  transactions: Transaction[];

  @OneToMany(() => Checkout, (checkouts) => checkouts.currency)
  checkouts: Checkout[];
}
