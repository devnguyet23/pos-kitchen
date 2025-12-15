import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoriesController {
                    constructor(private readonly categoriesService: CategoriesService) { }

                    @Post()
                    create(@Body() createCategoryDto: CreateCategoryDto) {
                                        return this.categoriesService.create(createCategoryDto);
                    }

                    @Get()
                    findAll() {
                                        return this.categoriesService.findAll();
                    }

                    @Get(':id')
                    findOne(@Param('id', ParseIntPipe) id: number) {
                                        return this.categoriesService.findOne(id);
                    }

                    @Put(':id')
                    update(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() updateCategoryDto: UpdateCategoryDto,
                    ) {
                                        return this.categoriesService.update(id, updateCategoryDto);
                    }

                    @Delete(':id')
                    remove(@Param('id', ParseIntPipe) id: number) {
                                        return this.categoriesService.remove(id);
                    }
}
