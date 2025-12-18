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
exports.ModifiersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const base_tenant_service_1 = require("../common/base-tenant.service");
let ModifiersService = class ModifiersService extends base_tenant_service_1.BaseTenantService {
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async create(createModifierDto, user) {
        return this.prisma.modifier.create({
            data: {
                ...createModifierDto,
                ...(user?.chainId && { chainId: user.chainId }),
            },
        });
    }
    findAll(user) {
        const where = {};
        if (user?.chainId) {
            where.chainId = user.chainId;
        }
        return this.prisma.modifier.findMany({ where });
    }
    async findOne(id) {
        const modifier = await this.prisma.modifier.findUnique({
            where: { id },
        });
        if (!modifier) {
            throw new common_1.NotFoundException(`Modifier with ID ${id} not found`);
        }
        return modifier;
    }
    async update(id, updateModifierDto) {
        await this.findOne(id);
        return this.prisma.modifier.update({
            where: { id },
            data: updateModifierDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const productModifierCount = await this.prisma.productModifier.count({
            where: { modifierId: id },
        });
        if (productModifierCount > 0) {
            throw new common_1.NotFoundException(`Không thể xóa modifier này vì đang được sử dụng bởi ${productModifierCount} sản phẩm.`);
        }
        return this.prisma.modifier.delete({
            where: { id },
        });
    }
};
exports.ModifiersService = ModifiersService;
exports.ModifiersService = ModifiersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModifiersService);
//# sourceMappingURL=modifiers.service.js.map