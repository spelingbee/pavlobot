import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Post("/create")
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
  @Post("/create/image/:id")
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param("id") id: number
  ) {
    return this.categoriesService.createImage(file, id);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
  @Get(":id")
  findById(@Param("id") id: string) {
    if (isNaN(+id)) {
      return this.categoriesService.findByArray(JSON.parse(id));
    }
    return this.categoriesService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.categoriesService.remove(+id);
  }
}
