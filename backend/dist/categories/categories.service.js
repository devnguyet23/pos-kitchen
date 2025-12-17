"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const base_tenant_service_1 = require("../common/base-tenant.service");
let CategoriesService = class CategoriesService extends base_tenant_service_1.BaseTenantService {
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async getHierarchyDepth(parentId, currentDepth = 1) {
        const parent = await this.prisma.category.findUnique({
            where: { id: parentId },
            select: { parentId: true }
        });
        if (!parent)
            return currentDepth;
        if (!parent.parentId)
            return currentDepth;
        return this.getHierarchyDepth(parent.parentId, currentDepth + 1);
    }
    async create(createCategoryDto, user) {
        if (createCategoryDto.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: createCategoryDto.parentId }
            });
            if (!parent) {
                throw new common_1.NotFoundException('Danh mục cha không tồn tại');
            }
            const depth = await this.getHierarchyDepth(createCategoryDto.parentId);
            if (depth >= 2) {
                throw new common_1.BadRequestException('Chỉ hỗ trợ tối đa 3 cấp danh mục');
            }
        }
        return this.prisma.category.create({
            data: Object.assign({ name: createCategoryDto.name, parentId: createCategoryDto.parentId || null }, ((user === null || user === void 0 ? void 0 : user.chainId) && { chainId: user.chainId })),
            include: {
                parent: true,
                children: true,
                _count: { select: { products: true } },
            },
        });
    }
    findAll(user) {
        const where = {};
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
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        await this.findOne(id);
        if (updateCategoryDto.parentId !== undefined) {
            if (updateCategoryDto.parentId === id) {
                throw new common_1.BadRequestException('Danh mục không thể là cha của chính nó');
            }
            if (updateCategoryDto.parentId) {
                const parent = await this.prisma.category.findUnique({
                    where: { id: updateCategoryDto.parentId }
                });
                if (!parent) {
                    throw new common_1.NotFoundException('Danh mục cha không tồn tại');
                }
                const depth = await this.getHierarchyDepth(updateCategoryDto.parentId);
                if (depth >= 2) {
                    throw new common_1.BadRequestException('Chỉ hỗ trợ tối đa 3 cấp danh mục');
                }
            }
        }
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
            include: {
                parent: true,
                children: true,
                _count: { select: { products: true } },
            },
        });
    }
    async remove(id) {
        const category = await this.findOne(id);
        const productCount = await this.prisma.product.count({
            where: { categoryId: id },
        });
        if (productCount > 0) {
            throw new common_1.BadRequestException(`Không thể xóa danh mục này vì có ${productCount} sản phẩm thuộc danh mục.`);
        }
        const childrenCount = await this.prisma.category.count({
            where: { parentId: id },
        });
        if (childrenCount > 0) {
            throw new common_1.BadRequestException(`Không thể xóa danh mục này vì có ${childrenCount} danh mục con.`);
        }
        return this.prisma.category.delete({
            where: { id },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map