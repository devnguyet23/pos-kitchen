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
exports.ChainsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChainsService = class ChainsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createChainDto) {
        const existing = await this.prisma.chain.findUnique({
            where: { code: createChainDto.code },
        });
        if (existing) {
            throw new common_1.ConflictException('Mã chuỗi đã tồn tại');
        }
        return this.prisma.chain.create({
            data: createChainDto,
        });
    }
    async findAll(params) {
        const { skip = 0, take = 10, search, status } = params;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        const [data, total] = await Promise.all([
            this.prisma.chain.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { stores: true, users: true },
                    },
                },
            }),
            this.prisma.chain.count({ where }),
        ]);
        return {
            data,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
            totalPages: Math.ceil(total / take),
        };
    }
    async findOne(id) {
        const chain = await this.prisma.chain.findUnique({
            where: { id },
            include: {
                stores: {
                    select: { id: true, name: true, code: true, status: true },
                },
                _count: {
                    select: { stores: true, users: true },
                },
            },
        });
        if (!chain) {
            throw new common_1.NotFoundException('Không tìm thấy chuỗi');
        }
        return chain;
    }
    async update(id, updateChainDto) {
        await this.findOne(id);
        return this.prisma.chain.update({
            where: { id },
            data: updateChainDto,
        });
    }
    async remove(id) {
        const chain = await this.findOne(id);
        if (chain._count.stores > 0) {
            throw new common_1.ConflictException('Không thể xóa chuỗi đang có cửa hàng');
        }
        return this.prisma.chain.delete({
            where: { id },
        });
    }
    async getStats(id) {
        await this.findOne(id);
        const [storeCount, userCount, activeStores] = await Promise.all([
            this.prisma.store.count({ where: { chainId: id } }),
            this.prisma.user.count({ where: { chainId: id } }),
            this.prisma.store.count({ where: { chainId: id, status: 'ACTIVE' } }),
        ]);
        return {
            storeCount,
            userCount,
            activeStores,
            inactiveStores: storeCount - activeStores,
        };
    }
};
exports.ChainsService = ChainsService;
exports.ChainsService = ChainsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChainsService);
//# sourceMappingURL=chains.service.js.map