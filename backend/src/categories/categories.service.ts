import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
                    constructor(private prisma: PrismaService) { }

                    async create(createCategoryDto: CreateCategoryDto) {
                                        return this.prisma.category.create({
                                                            data: createCategoryDto,
                                        });
                    }

                    findAll() {
                                        return this.prisma.category.findMany({
                                                            include: {
                                                                                _count: {
                                                                                                    select: { products: true },
                                                                                },
                                                            },
                                        });
                    }

                    async findOne(id: number) {
                                        const category = await this.prisma.category.findUnique({
                                                            where: { id },
                                                            include: {
                                                                                products: true,
                                                            },
                                        });

                                        if (!category) {
                                                            throw new NotFoundException(`Category with ID ${id} not found`);
                                        }

                                        return category;
                    }

                    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
                                        await this.findOne(id);

                                        return this.prisma.category.update({
                                                            where: { id },
                                                            data: updateCategoryDto,
                                        });
                    }

                    async remove(id: number) {
                                        await this.findOne(id);

                                        // Check if category has products
                                        const productCount = await this.prisma.product.count({
                                                            where: { categoryId: id },
                                        });

                                        if (productCount > 0) {
                                                            throw new NotFoundException(
                                                                                `Không thể xóa danh mục này vì có ${productCount} sản phẩm thuộc danh mục.`
                                                            );
                                        }

                                        return this.prisma.category.delete({
                                                            where: { id },
                                        });
                    }
}
