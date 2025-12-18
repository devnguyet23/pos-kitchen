import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BaseTenantService } from '../common/base-tenant.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CategoriesService extends BaseTenantService {
                    constructor(
                                        private prisma: PrismaService,
                                        private cacheService: CacheService,
                    ) {
                                        super();
                    }

                    // Helper to get hierarchy depth
                    private async getHierarchyDepth(parentId: number, currentDepth = 1): Promise<number> {
                                        const parent = await this.prisma.category.findUnique({
                                                            where: { id: parentId },
                                                            select: { parentId: true }
                                        });

                                        if (!parent) return currentDepth;
                                        if (!parent.parentId) return currentDepth;

                                        return this.getHierarchyDepth(parent.parentId, currentDepth + 1);
                    }

                    async create(createCategoryDto: CreateCategoryDto, user?: CurrentUserData) {
                                        // Validate parent exists and check depth limit (max 3 levels)
                                        if (createCategoryDto.parentId) {
                                                            const parent = await this.prisma.category.findUnique({
                                                                                where: { id: createCategoryDto.parentId }
                                                            });

                                                            if (!parent) {
                                                                                throw new NotFoundException('Danh mục cha không tồn tại');
                                                            }

                                                            const depth = await this.getHierarchyDepth(createCategoryDto.parentId);
                                                            if (depth >= 2) {
                                                                                throw new BadRequestException('Chỉ hỗ trợ tối đa 3 cấp danh mục');
                                                            }
                                        }

                                        const result = await this.prisma.category.create({
                                                            data: {
                                                                                name: createCategoryDto.name,
                                                                                parentId: createCategoryDto.parentId || null,
                                                                                ...(user?.chainId && { chainId: user.chainId }),
                                                            },
                                                            include: {
                                                                                parent: true,
                                                                                children: true,
                                                                                _count: { select: { products: true } },
                                                            },
                                        });

                                        // Invalidate cache
                                        await this.cacheService.invalidateCategories(user?.chainId);
                                        return result;
                    }

                    async findAll(user?: CurrentUserData) {
                                        // Build cache key based on chain
                                        const chainId = user?.chainId || 0;
                                        const cacheKey = this.cacheService.buildKey(
                                                            CacheService.PREFIX.CATEGORIES,
                                                            'chain',
                                                            chainId,
                                                            'all'
                                        );

                                        // Use cache-aside pattern
                                        return this.cacheService.getOrSet(
                                                            cacheKey,
                                                            async () => {
                                                                                const where: { chainId?: number } = {};
                                                                                if (user) {
                                                                                                    const tenantFilter = this.getChainFilter(user);
                                                                                                    if (tenantFilter.chainId) {
                                                                                                                        where.chainId = tenantFilter.chainId;
                                                                                                    }
                                                                                }

                                                                                return this.prisma.category.findMany({
                                                                                                    where,
                                                                                                    include: {
                                                                                                                        parent: true,
                                                                                                                        children: {
                                                                                                                                            include: {
                                                                                                                                                                children: true,
                                                                                                                                                                _count: { select: { products: true } },
                                                                                                                                            }
                                                                                                                        },
                                                                                                                        _count: { select: { products: true } },
                                                                                                    },
                                                                                                    orderBy: { id: 'asc' },
                                                                                });
                                                            },
                                                            CacheService.TTL.LONG  // 15 minutes cache
                                        );
                    }

                    async findOne(id: number) {
                                        const category = await this.prisma.category.findUnique({
                                                            where: { id },
                                                            include: {
                                                                                parent: true,
                                                                                children: {
                                                                                                    include: {
                                                                                                                        children: true,
                                                                                                                        _count: { select: { products: true } },
                                                                                                    }
                                                                                },
                                                                                products: true,
                                                                                _count: { select: { products: true } },
                                                            },
                                        });

                                        if (!category) {
                                                            throw new NotFoundException(`Category with ID ${id} not found`);
                                        }

                                        return category;
                    }

                    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
                                        await this.findOne(id);

                                        // Validate parent if provided
                                        if (updateCategoryDto.parentId !== undefined) {
                                                            if (updateCategoryDto.parentId === id) {
                                                                                throw new BadRequestException('Danh mục không thể là cha của chính nó');
                                                            }

                                                            if (updateCategoryDto.parentId) {
                                                                                const parent = await this.prisma.category.findUnique({
                                                                                                    where: { id: updateCategoryDto.parentId }
                                                                                });

                                                                                if (!parent) {
                                                                                                    throw new NotFoundException('Danh mục cha không tồn tại');
                                                                                }

                                                                                const depth = await this.getHierarchyDepth(updateCategoryDto.parentId);
                                                                                if (depth >= 2) {
                                                                                                    throw new BadRequestException('Chỉ hỗ trợ tối đa 3 cấp danh mục');
                                                                                }
                                                            }
                                        }

                                        const result = await this.prisma.category.update({
                                                            where: { id },
                                                            data: updateCategoryDto,
                                                            include: {
                                                                                parent: true,
                                                                                children: true,
                                                                                _count: { select: { products: true } },
                                                            },
                                        });

                                        // Invalidate cache
                                        await this.cacheService.invalidateCategories(result.chainId ?? undefined);
                                        return result;
                    }

                    async remove(id: number) {
                                        const category = await this.findOne(id);

                                        // Check if category has products
                                        const productCount = await this.prisma.product.count({
                                                            where: { categoryId: id },
                                        });

                                        if (productCount > 0) {
                                                            throw new BadRequestException(
                                                                                `Không thể xóa danh mục này vì có ${productCount} sản phẩm thuộc danh mục.`
                                                            );
                                        }

                                        // Check if category has children
                                        const childrenCount = await this.prisma.category.count({
                                                            where: { parentId: id },
                                        });

                                        if (childrenCount > 0) {
                                                            throw new BadRequestException(
                                                                                `Không thể xóa danh mục này vì có ${childrenCount} danh mục con.`
                                                            );
                                        }

                                        const result = await this.prisma.category.delete({
                                                            where: { id },
                                        });

                                        // Invalidate cache
                                        await this.cacheService.invalidateCategories(category.chainId ?? undefined);
                                        return result;
                    }
}
