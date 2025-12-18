import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
                    constructor(private readonly productsService: ProductsService) { }

                    @Post()
                    @RequirePermissions('create_product')
                    create(
                                        @Body() createProductDto: CreateProductDto,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.productsService.create(createProductDto, user);
                    }

                    @Get()
                    @RequirePermissions('view_products')
                    findAll(
                                        @Query('page') page?: string,
                                        @Query('limit') limit?: string,
                                        @Query('search') search?: string,
                                        @Query('categoryId') categoryId?: string,
                                        @Query('sortBy') sortBy?: 'id' | 'name' | 'price',
                                        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
                                        @CurrentUser() user?: CurrentUserData,
                    ) {
                                        return this.productsService.findAll({
                                                            page: page ? parseInt(page, 10) : undefined,
                                                            limit: limit ? parseInt(limit, 10) : undefined,
                                                            search,
                                                            categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
                                                            sortBy,
                                                            sortOrder,
                                        }, user);
                    }

                    @Get(':id')
                    @RequirePermissions('view_products')
                    findOne(@Param('id', ParseIntPipe) id: number) {
                                        return this.productsService.findOne(id);
                    }

                    @Put(':id')
                    @RequirePermissions('edit_product')
                    update(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() updateProductDto: UpdateProductDto,
                    ) {
                                        return this.productsService.update(id, updateProductDto);
                    }

                    @Delete(':id')
                    @RequirePermissions('delete_product')
                    remove(@Param('id', ParseIntPipe) id: number) {
                                        return this.productsService.remove(id);
                    }
}
