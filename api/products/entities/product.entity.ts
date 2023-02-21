import { BaseEntity } from "../../utils/dto.utils";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Category } from "../../categories/entities/category.entity";
import { Coordinates } from "../../utils/types/coordinates";
import { Order } from "../../orders/entities/order.entity";

@Entity("products")
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: "text" })
  description: string;

  @Column()
  img: string;

  @Column({ type: "jsonb" })
  coordinates: Coordinates;

  @Column()
  address: string;

  @OneToMany(() => Order, (orders) => orders.product)
  orders: Order[];

  @OneToMany(() => Category, (categories) => categories.product)
  categories: Category[];

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: "category_id" })
  category: Category;
}
