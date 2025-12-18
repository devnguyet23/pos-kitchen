import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
                    constructor(private readonly categoriesService: CategoriesService) { }

                    @Post()
                    @RequirePermissions('manage_categories')
                    create(
                                        @Body() createCategoryDto: CreateCategoryDto,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.categoriesService.create(createCategoryDto, user);
                    }

                    @Get()
                    @RequirePermissions('view_products')
                    findAll(@CurrentUser() user: CurrentUserData) {
                                        return this.categoriesService.findAll(user);
                    }

                    @Get(':id')
                    @RequirePermissions('view_products')
                    findOne(@Param('id', ParseIntPipe) id: number) {
                                        return this.categoriesService.findOne(id);
                    }

                    @Put(':id')
                    @RequirePermissions('manage_categories')
                    update(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() updateCategoryDto: UpdateCategoryDto,
                    ) {
                                        return this.categoriesService.update(id, updateCategoryDto);
                    }

                    @Delete(':id')
                    @RequirePermissions('manage_categories')
                    remove(@Param('id', ParseIntPipe) id: number) {
                                        return this.categoriesService.remove(id);
                    }
}
