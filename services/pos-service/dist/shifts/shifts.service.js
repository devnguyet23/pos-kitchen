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
exports.ShiftsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let ShiftsService = class ShiftsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async openShift(data, user) {
        if (!user.storeId) {
            throw new common_1.ForbiddenException('Bạn cần thuộc về một cửa hàng để mở ca');
        }
        const existingShift = await this.prisma.shift.findFirst({
            where: {
                userId: user.id,
                status: 'OPEN',
            },
        });
        if (existingShift) {
            throw new common_1.ConflictException('Bạn đang có ca làm việc đang mở');
        }
        const shiftCode = `SHIFT-${Date.now()}-${user.id}`;
        return this.prisma.shift.create({
            data: {
                storeId: user.storeId,
                userId: user.id,
                shiftCode,
                openingCash: data.openingCash,
                status: 'OPEN',
            },
            include: {
                user: { select: { id: true, fullName: true, username: true } },
                store: { select: { id: true, name: true, code: true } },
            },
        });
    }
    async closeShift(id, data, user) {
        const shift = await this.findOne(id, user);
        if (shift.status === 'CLOSED') {
            throw new common_1.ConflictException('Ca này đã được đóng');
        }
        if (shift.userId !== user.id && !this.canCloseOtherShift(user)) {
            throw new common_1.ForbiddenException('Bạn không có quyền đóng ca này');
        }
        const expectedCash = new library_1.Decimal(shift.openingCash).add(shift.totalSales).sub(shift.totalRefunds);
        const cashDifference = new library_1.Decimal(data.closingCash).sub(expectedCash);
        return this.prisma.shift.update({
            where: { id },
            data: {
                closingCash: data.closingCash,
                expectedCash,
                cashDifference,
                closedAt: new Date(),
                closedBy: user.id,
                status: 'CLOSED',
                note: data.note,
            },
            include: {
                user: { select: { id: true, fullName: true, username: true } },
                store: { select: { id: true, name: true, code: true } },
            },
        });
    }
    async findAll(params, user) {
        const { skip = 0, take = 10, storeId, status, userId } = params;
        const where = {};
        if (!this.isSuperAdmin(user)) {
            if (user.storeId) {
                where.storeId = user.storeId;
            }
            else if (user.chainId) {
                where.store = { chainId: user.chainId };
            }
        }
        else if (storeId) {
            where.storeId = storeId;
        }
        if (status)
            where.status = status;
        if (userId)
            where.userId = userId;
        const [data, total] = await Promise.all([
            this.prisma.shift.findMany({
                where,
                skip,
                take,
                orderBy: { openedAt: 'desc' },
                include: {
                    user: { select: { id: true, fullName: true, username: true } },
                    store: { select: { id: true, name: true, code: true } },
                    closedByUser: { select: { id: true, fullName: true, username: true } },
                },
            }),
            this.prisma.shift.count({ where }),
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
        const shift = await this.prisma.shift.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, fullName: true, username: true } },
                store: { select: { id: true, name: true, code: true, chainId: true } },
                closedByUser: { select: { id: true, fullName: true, username: true } },
            },
        });
        if (!shift) {
            throw new common_1.NotFoundException('Không tìm thấy ca làm việc');
        }
        if (!this.hasShiftAccess(user, shift)) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem ca làm việc này');
        }
        return shift;
    }
    async getCurrentShift(user) {
        const shift = await this.prisma.shift.findFirst({
            where: {
                userId: user.id,
                status: 'OPEN',
            },
            include: {
                store: { select: { id: true, name: true, code: true } },
            },
        });
        return shift;
    }
    async getMyShifts(user, params) {
        const { skip = 0, take = 10 } = params;
        const [data, total] = await Promise.all([
            this.prisma.shift.findMany({
                where: { userId: user.id },
                skip,
                take,
                orderBy: { openedAt: 'desc' },
                include: {
                    store: { select: { id: true, name: true, code: true } },
                },
            }),
            this.prisma.shift.count({ where: { userId: user.id } }),
        ]);
        return { data, total };
    }
    isSuperAdmin(user) {
        return user.roles.some(r => r.code === 'super_admin');
    }
    canCloseOtherShift(user) {
        return user.permissions.includes('close_others_shift');
    }
    hasShiftAccess(user, shift) {
        if (this.isSuperAdmin(user))
            return true;
        if (shift.userId === user.id)
            return true;
        if (user.storeId && user.storeId === shift.storeId)
            return true;
        if (user.chainId && shift.store?.chainId === user.chainId)
            return true;
        return false;
    }
};
exports.ShiftsService = ShiftsService;
exports.ShiftsService = ShiftsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShiftsService);
//# sourceMappingURL=shifts.service.js.map