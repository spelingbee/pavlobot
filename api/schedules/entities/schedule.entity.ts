import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BaseEntity } from "../../utils/dto.utils";
import { Order } from "../../orders/entities/order.entity";
import { Category } from "../../categories/entities/category.entity";

@Entity("schedules")
export class Schedule extends BaseEntity {
  @Column({ name: "start_time" })
  startTime: Date;

  @Column({ name: "end_time" })
  endTime: Date;

  @OneToOne(() => Order, (order) => order.schedule)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Category, (category) => category.schedules)
  @JoinColumn({ name: "category_id" })
  category: Category;
}
