import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { In, Repository } from "typeorm";
import { Order } from "../orders/entities/order.entity";
import { Product } from "../products/entities/product.entity";
import fs from "fs";
import * as uuid from "uuid";
import { join, resolve } from "path";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    public categoriesRepository: Repository<Category>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const orders: Order[] = [];
    if (createCategoryDto.ordersId) {
      for (const id of createCategoryDto.ordersId) {
        orders.push(
          await this.ordersRepository.findOneBy({
            id,
          })
        );
      }
    }
    const categories: Category[] = [];
    if (createCategoryDto.categoriesId) {
      for (const id of createCategoryDto.categoriesId) {
        const childCategory = await this.categoriesRepository.findOne({
          where: [
            {
              id: id,
            },
          ],
        });
        categories.push(childCategory);
      }
    }

    const products: Product[] = [];
    if (createCategoryDto.productsId) {
      for (const id of createCategoryDto.productsId) {
        products.push(
          await this.productsRepository.findOneBy({
            id,
          })
        );
      }
    }
    const relationCategory = await this.categoriesRepository.findOneBy({
      id: createCategoryDto.categoryId,
    });
    const relationProduct = await this.productsRepository.findOneBy({
      id: createCategoryDto.productId,
    });
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      product: relationProduct,
      category: relationCategory,
      categories,
      products,
      orders,
    });
    return await this.categoriesRepository.save(category);
  }
  async createImage(file, id: number) {
    if (!file) throw new BadRequestException('Неправильный формат файла')
    const category = await this.categoriesRepository.findOne({
      where: {
        id,
      },
      relations: [
        "categories",
        "categories.category",
        "category",
        "category.category",
        "product",
        "products",
        "orders",
      ],
    });
    if (!category) {
      throw new BadRequestException("Нет такой категории");
    }
    uuid.v4();
    const filePath = resolve(__dirname, "../../", "client/img");
    const fileName = uuid.v4() + "." + file.originalname.split(".").at(-1);
    fs.writeFileSync(join(filePath, fileName), file.buffer);
    if (category.img && fs.existsSync(join(filePath, category.img))) {
      fs.unlinkSync(join(filePath, category.img));
    }
    category.img = fileName;
    return await this.categoriesRepository.save(category);
  }

  async findAll() {
    const categories = await this.categoriesRepository.find({
      where: {
        isActive: true,
      },
      relations: [
        "categories",
        "categories.category",
        "category",
        "category.category",
        "product",
        "products",
        "orders",
      ],
    });
    return categories;
  }

  async findOne(id: number) {
    return await this.categoriesRepository.findOne({
      where: {
        id,
      },
      relations: [
        "categories",
        "categories.category",
        "category",
        "category.category",
        "product",
        "products",
        "orders",
      ],
    });
  }
  async findByArray(ids: number[]) {
    return await this.categoriesRepository.find({
      where: ids.map((item) => ({ id: item })),
      relations: [
        "categories",
        "categories.category",
        "category",
        "category.category",
        "product",
        "products",
        "orders",
      ],
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findOne({
      where: {
        id,
      },
      relations: ["category", "categories"],
    });
    let parentCategory;
    let categories;
    if (updateCategoryDto.categoryId) {
      parentCategory = await this.categoriesRepository.findOne({
        where: {
          id: updateCategoryDto.categoryId,
        },
      });
    } else {
      parentCategory = category.category;
    }
    if (updateCategoryDto.categoriesId.length) {
      categories = await this.categoriesRepository.find({
        where: {
          id: In(updateCategoryDto.categoriesId),
        },
      });
    } else {
      categories = category.categories;
    }
    Object.assign(category, {
      ...updateCategoryDto,
      category: parentCategory,
      categories: categories,
    });
    return await this.categoriesRepository.save(category);
  }

  async remove(id: number) {
    return await this.categoriesRepository.delete(id);
  }
}
