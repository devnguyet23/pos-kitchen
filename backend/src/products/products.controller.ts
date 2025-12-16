import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
                    constructor(private readonly productsService: ProductsService) { }

                    @Post()
                    create(@Body() createProductDto: CreateProductDto) {
                                        return this.productsService.create(createProductDto);
                    }

                    @Get()
                    findAll(
                                        @Query('page') page?: string,
                                        @Query('limit') limit?: string,
                                        @Query('search') search?: string,
                                        @Query('categoryId') categoryId?: string,
                                        @Query('sortBy') sortBy?: 'id' | 'name' | 'price',
                                        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
                    ) {
                                        return this.productsService.findAll({
                                                            page: page ? parseInt(page, 10) : undefined,
                                                            limit: limit ? parseInt(limit, 10) : undefined,
                                                            search,
                                                            categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
                                                            sortBy,
                                                            sortOrder,
                                        });
                    }

                    @Get(':id')
                    findOne(@Param('id', ParseIntPipe) id: number) {
                                        return this.productsService.findOne(id);
                    }

                    @Put(':id')
                    update(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() updateProductDto: UpdateProductDto,
                    ) {
                                        return this.productsService.update(id, updateProductDto);
                    }

                    @Delete(':id')
                    remove(@Param('id', ParseIntPipe) id: number) {
                                        return this.productsService.remove(id);
                    }
}
