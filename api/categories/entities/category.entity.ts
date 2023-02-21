import { BaseEntity } from "../../utils/dto.utils";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { Coordinates } from "../../utils/types/coordinates";
import { Order } from "../../orders/entities/order.entity";
import { Checkout } from "../../checkouts/entities/checkout.entity";
import { Schedule } from "../../schedules/entities/schedule.entity";

@Entity("categories")
export class Category extends BaseEntity {
  @Column({ nullable: true })
  name?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  duration?: number;

  @Column({ name: "duration_in_milliseconds", nullable: true, type: "int8" })
  durationInMilliseconds?: number;

  @Column({ nullable: true })
  img: string;

  @Column({ name: "initial_price", type: "float8", nullable: true })
  initialPrice?: number;

  @Column({ type: "jsonb", nullable: true })
  coordinates?: Coordinates;

  @Column({ nullable: true })
  address?: string;

  @Column({ name: "is_product", default: false })
  isProduct: boolean;

  @Column({ name: "description_active", default: true })
  descriptionActive: boolean;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @Column({ name: "is_period", default: true })
  isPeriod: boolean;

  @Column({ name: "is_office", default: false })
  isOffice: boolean;

  @OneToMany(() => Order, (orders) => orders.category)
  orders: Order[];

  @OneToMany(() => Schedule, (schedules) => schedules.category)
  schedules: Schedule[];

  @OneToMany(() => Checkout, (checkouts) => checkouts.category)
  checkouts: Checkout[];

  @OneToMany(() => Category, (category) => category.category)
  categories: Category[];

  @ManyToOne(() => Category, (category) => category.categories)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @OneToMany(() => Category, (children) => children.office)
  children: Category[];

  @ManyToOne(() => Category, (office) => office.children)
  @JoinColumn({ name: "office_id" })
  office: Category;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ManyToOne(() => Product, (product) => product.categories)
  @JoinColumn({ name: "product_id" })
  product: Product;
}
