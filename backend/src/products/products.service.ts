import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
                    constructor(private prisma: PrismaService) { }

                    async create(createProductDto: CreateProductDto) {
                                        const { modifierIds, ...data } = createProductDto;

                                        const product = await this.prisma.product.create({
                                                            data: {
                                                                                name: data.name,
                                                                                price: data.price,
                                                                                category: { connect: { id: data.categoryId } },
                                                                                ...(modifierIds && modifierIds.length > 0 && {
                                                                                                    modifiers: {
                                                                                                                        create: modifierIds.map(modifierId => ({
                                                                                                                                            modifier: { connect: { id: modifierId } }
                                                                                                                        }))
                                                                                                    }
                                                                                })
                                                            },
                                                            include: {
                                                                                category: true,
                                                                                modifiers: {
                                                                                                    include: {
                                                                                                                        modifier: true,
                                                                                                    },
                                                                                },
                                                            },
                                        });

                                        return product;
                    }

                    findAll() {
                                        return this.prisma.product.findMany({
                                                            include: {
                                                                                category: true,
                                                                                modifiers: {
                                                                                                    include: {
                                                                                                                        modifier: true,
                                                                                                    },
                                                                                },
                                                            },
                                        });
                    }

                    async findOne(id: number) {
                                        const product = await this.prisma.product.findUnique({
                                                            where: { id },
                                                            include: {
                                                                                category: true,
                                                                                modifiers: {
                                                                                                    include: {
                                                                                                                        modifier: true,
                                                                                                    },
                                                                                },
                                                            },
                                        });

                                        if (!product) {
                                                            throw new NotFoundException(`Product with ID ${id} not found`);
                                        }

                                        return product;
                    }

                    async update(id: number, updateProductDto: UpdateProductDto) {
                                        await this.findOne(id);

                                        const { categoryId, modifierIds, ...data } = updateProductDto;

                                        // If modifierIds is provided, update the modifiers
                                        if (modifierIds !== undefined) {
                                                            // Delete existing modifiers
                                                            await this.prisma.productModifier.deleteMany({
                                                                                where: { productId: id }
                                                            });

                                                            // Create new modifiers
                                                            if (modifierIds.length > 0) {
                                                                                await this.prisma.productModifier.createMany({
                                                                                                    data: modifierIds.map(modifierId => ({
                                                                                                                        productId: id,
                                                                                                                        modifierId
                                                                                                    }))
                                                                                });
                                                            }
                                        }

                                        return this.prisma.product.update({
                                                            where: { id },
                                                            data: {
                                                                                ...data,
                                                                                ...(categoryId && { category: { connect: { id: categoryId } } }),
                                                            },
                                                            include: {
                                                                                category: true,
                                                                                modifiers: {
                                                                                                    include: {
                                                                                                                        modifier: true,
                                                                                                    },
                                                                                },
                                                            },
                                        });
                    }

                    async remove(id: number) {
                                        await this.findOne(id);

                                        // Check if product has been used in orders
                                        const orderItemCount = await this.prisma.orderItem.count({
                                                            where: { productId: id }
                                        });

                                        if (orderItemCount > 0) {
                                                            throw new NotFoundException(
                                                                                `Không thể xóa sản phẩm này vì đã có ${orderItemCount} đơn hàng liên quan. Hãy sử dụng chức năng ẩn sản phẩm thay vì xóa.`
                                                            );
                                        }

                                        // Use transaction to delete related records first
                                        return this.prisma.$transaction(async (tx) => {
                                                            // Delete product modifiers
                                                            await tx.productModifier.deleteMany({
                                                                                where: { productId: id }
                                                            });

                                                            // Delete recipes
                                                            await tx.recipe.deleteMany({
                                                                                where: { productId: id }
                                                            });

                                                            // Delete the product
                                                            return tx.product.delete({
                                                                                where: { id }
                                                            });
                                        });
                    }
}
