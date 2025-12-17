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
exports.StoresManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StoresManagementService = class StoresManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createStoreDto, user) {
        const existing = await this.prisma.store.findUnique({
            where: { code: createStoreDto.code },
        });
        if (existing) {
            throw new common_1.ConflictException('Mã cửa hàng đã tồn tại');
        }
        if (!this.hasChainAccess(user, createStoreDto.chainId)) {
            throw new common_1.ForbiddenException('Bạn không có quyền tạo cửa hàng trong chuỗi này');
        }
        return this.prisma.store.create({
            data: createStoreDto,
            include: {
                chain: { select: { id: true, name: true, code: true } },
            },
        });
    }
    async findAll(params, user) {
        const { skip = 0, take = 10, search, status, chainId } = params;
        const where = {};
        if (!this.isSuperAdmin(user)) {
            if (user.chainId) {
                where.chainId = user.chainId;
            }
            if (user.storeId) {
                where.id = user.storeId;
            }
        }
        else if (chainId) {
            where.chainId = chainId;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        const [data, total] = await Promise.all([
            this.prisma.store.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    chain: { select: { id: true, name: true, code: true } },
                    _count: {
                        select: { users: true, shifts: true },
                    },
                },
            }),
            this.prisma.store.count({ where }),
        ]);
        return {
            data,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
            totalPages: Math.ceil(total / take),
        };
    }
    async findOne(id, user) {
        const store = await this.prisma.store.findUnique({
            where: { id },
            include: {
                chain: { select: { id: true, name: true, code: true } },
                users: {
                    select: { id: true, username: true, fullName: true, status: true },
                    take: 10,
                },
                _count: {
                    select: { users: true, shifts: true },
                },
            },
        });
        if (!store) {
            throw new common_1.NotFoundException('Không tìm thấy cửa hàng');
        }
        if (!this.hasStoreAccess(user, store.id, store.chainId)) {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập cửa hàng này');
        }
        return store;
    }
    async update(id, updateStoreDto, user) {
        const store = await this.findOne(id, user);
        if (!this.hasChainAccess(user, store.chainId)) {
            throw new common_1.ForbiddenException('Bạn không có quyền sửa cửa hàng này');
        }
        return this.prisma.store.update({
            where: { id },
            data: updateStoreDto,
            include: {
                chain: { select: { id: true, name: true, code: true } },
            },
        });
    }
    async remove(id, user) {
        const store = await this.findOne(id, user);
        if (!this.hasChainAccess(user, store.chainId)) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa cửa hàng này');
        }
        if (store._count.users > 0) {
            throw new common_1.ConflictException('Không thể xóa cửa hàng đang có nhân viên');
        }
        return this.prisma.store.delete({
            where: { id },
        });
    }
    async getStats(id, user) {
        await this.findOne(id, user);
        const [userCount, activeUsers, shiftCount, openShifts] = await Promise.all([
            this.prisma.user.count({ where: { storeId: id } }),
            this.prisma.user.count({ where: { storeId: id, status: 'ACTIVE' } }),
            this.prisma.shift.count({ where: { storeId: id } }),
            this.prisma.shift.count({ where: { storeId: id, status: 'OPEN' } }),
        ]);
        return {
            userCount,
            activeUsers,
            shiftCount,
            openShifts,
        };
    }
    isSuperAdmin(user) {
        return user.roles.some(r => r.code === 'super_admin');
    }
    hasChainAccess(user, chainId) {
        if (this.isSuperAdmin(user))
            return true;
        return user.chainId === chainId || user.roles.some(r => r.chainId === chainId);
    }
    hasStoreAccess(user, storeId, chainId) {
        if (this.isSuperAdmin(user))
            return true;
        if (this.hasChainAccess(user, chainId))
            return true;
        return user.storeId === storeId;
    }
};
exports.StoresManagementService = StoresManagementService;
exports.StoresManagementService = StoresManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoresManagementService);
//# sourceMappingURL=stores-management.service.js.map