import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { UpdateUserDto } from "./dto/update-user.dto";
import { StatusEnum } from "./enums/status.enum";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    public usersRepository: Repository<User>
  ) {}
  async createUser(userDto: CreateUserDto) {
    const possibleUser = await this.usersRepository.findOneBy({
      id: userDto.id,
    });
    if (possibleUser) {
      throw new BadRequestException(
        new Error("Такой пользователь уже существует")
      );
    }
    const user = await this.usersRepository.create(userDto);
    return await this.usersRepository.save(user);
  }

  async findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number, relations = []) {
    return await this.usersRepository.findOne({
      where: {
        id,
      },
      relations,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersRepository.findOneBy({
        id,
      });
      if (
        (updateUserDto.status === "opened" ||
          updateUserDto.status === "started") &&
        user.status === "booked"
      ) {
        updateUserDto.status = StatusEnum.booked;
      }
      return await this.usersRepository.update(
        {
          id,
        },
        updateUserDto
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
