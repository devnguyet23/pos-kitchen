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
                                                                                image: data.image,
                                                                                status: data.status ?? 1,
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

                    // Normalize Vietnamese text for accent-insensitive search
                    private normalizeVietnamese(str: string): string {
                                        return str
                                                            .normalize("NFD")
                                                            .replace(/[\u0300-\u036f]/g, "")
                                                            .replace(/đ/g, "d")
                                                            .replace(/Đ/g, "D")
                                                            .toLowerCase();
                    }

                    async findAll(params: {
                                        page?: number;
                                        limit?: number;
                                        search?: string;
                                        categoryId?: number;
                                        sortBy?: 'id' | 'name' | 'price';
                                        sortOrder?: 'asc' | 'desc';
                    } = {}) {
                                        const {
                                                            page = 1,
                                                            limit,
                                                            search,
                                                            categoryId,
                                                            sortBy = 'id',
                                                            sortOrder = 'asc'
                                        } = params;

                                        // Build where clause (without search - we'll filter in memory)
                                        const where: any = {};

                                        if (categoryId) {
                                                            where.categoryId = categoryId;
                                        }

                                        // Build orderBy
                                        const orderBy: any = {};
                                        orderBy[sortBy] = sortOrder;

                                        // Fetch all products (with category filter if provided)
                                        let allProducts = await this.prisma.product.findMany({
                                                            where,
                                                            orderBy,
                                                            include: {
                                                                                category: true,
                                                                                modifiers: {
                                                                                                    include: {
                                                                                                                        modifier: true,
                                                                                                    },
                                                                                },
                                                            },
                                        });

                                        // Apply search filter in memory (accent-insensitive)
                                        if (search) {
                                                            const normalizedSearch = this.normalizeVietnamese(search);
                                                            allProducts = allProducts.filter(product =>
                                                                                this.normalizeVietnamese(product.name).includes(normalizedSearch) ||
                                                                                this.normalizeVietnamese(product.category?.name || '').includes(normalizedSearch)
                                                            );
                                        }

                                        // Calculate total after filtering
                                        const total = allProducts.length;

                                        // Apply pagination
                                        let data = allProducts;
                                        if (limit) {
                                                            const startIndex = (page - 1) * limit;
                                                            data = allProducts.slice(startIndex, startIndex + limit);
                                        }

                                        return {
                                                            data,
                                                            pagination: {
                                                                                page,
                                                                                limit: limit || total,
                                                                                total,
                                                                                totalPages: limit ? Math.ceil(total / limit) : 1
                                                            }
                                        };
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
