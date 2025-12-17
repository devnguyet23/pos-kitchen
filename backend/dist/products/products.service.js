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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const base_tenant_service_1 = require("../common/base-tenant.service");
let ProductsService = class ProductsService extends base_tenant_service_1.BaseTenantService {
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async create(createProductDto, user) {
        var _a;
        const { modifierIds } = createProductDto, data = __rest(createProductDto, ["modifierIds"]);
        const product = await this.prisma.product.create({
            data: Object.assign(Object.assign({ name: data.name, price: data.price, image: data.image, status: (_a = data.status) !== null && _a !== void 0 ? _a : 1, category: { connect: { id: data.categoryId } } }, ((user === null || user === void 0 ? void 0 : user.chainId) && { chain: { connect: { id: user.chainId } } })), (modifierIds && modifierIds.length > 0 && {
                modifiers: {
                    create: modifierIds.map(modifierId => ({
                        modifier: { connect: { id: modifierId } }
                    }))
                }
            })),
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
    normalizeVietnamese(str) {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase();
    }
    async findAll(params = {}, user) {
        const { page = 1, limit, search, categoryId, sortBy = 'id', sortOrder = 'asc' } = params;
        const where = {};
        if (user === null || user === void 0 ? void 0 : user.chainId) {
            where.chainId = user.chainId;
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
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
        if (search) {
            const normalizedSearch = this.normalizeVietnamese(search);
            allProducts = allProducts.filter(product => {
                var _a;
                return this.normalizeVietnamese(product.name).includes(normalizedSearch) ||
                    this.normalizeVietnamese(((_a = product.category) === null || _a === void 0 ? void 0 : _a.name) || '').includes(normalizedSearch);
            });
        }
        const total = allProducts.length;
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async update(id, updateProductDto) {
        await this.findOne(id);
        const { categoryId, modifierIds } = updateProductDto, data = __rest(updateProductDto, ["categoryId", "modifierIds"]);
        if (modifierIds !== undefined) {
            await this.prisma.productModifier.deleteMany({
                where: { productId: id }
            });
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
            data: Object.assign(Object.assign({}, data), (categoryId && { category: { connect: { id: categoryId } } })),
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
    async remove(id) {
        await this.findOne(id);
        const orderItemCount = await this.prisma.orderItem.count({
            where: { productId: id }
        });
        if (orderItemCount > 0) {
            throw new common_1.NotFoundException(`Không thể xóa sản phẩm này vì đã có ${orderItemCount} đơn hàng liên quan. Hãy sử dụng chức năng ẩn sản phẩm thay vì xóa.`);
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.productModifier.deleteMany({
                where: { productId: id }
            });
            await tx.recipe.deleteMany({
                where: { productId: id }
            });
            return tx.product.delete({
                where: { id }
            });
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map