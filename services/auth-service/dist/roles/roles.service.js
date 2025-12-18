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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RolesService = class RolesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const { skip = 0, take = 20, level } = params;
        const where = {};
        if (level)
            where.level = level;
        const [data, total] = await Promise.all([
            this.prisma.role.findMany({
                where,
                skip,
                take,
                orderBy: { level: 'asc' },
                include: {
                    _count: {
                        select: { permissions: true, userRoles: true },
                    },
                },
            }),
            this.prisma.role.count({ where }),
        ]);
        return { data, total };
    }
    async findOne(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: { userRoles: true },
                },
            },
        });
        if (!role) {
            throw new common_1.NotFoundException('Không tìm thấy vai trò');
        }
        return role;
    }
    async create(data, currentUser) {
        if (!this.isSuperAdmin(currentUser)) {
            throw new common_1.ForbiddenException('Chỉ Super Admin mới có thể tạo vai trò');
        }
        const existing = await this.prisma.role.findUnique({
            where: { code: data.code },
        });
        if (existing) {
            throw new common_1.ConflictException('Mã vai trò đã tồn tại');
        }
        return this.prisma.role.create({
            data: {
                ...data,
                isSystem: false,
            },
        });
    }
    async update(id, data, currentUser) {
        const role = await this.findOne(id);
        if (role.isSystem && !this.isSuperAdmin(currentUser)) {
            throw new common_1.ForbiddenException('Không thể sửa vai trò hệ thống');
        }
        return this.prisma.role.update({
            where: { id },
            data,
        });
    }
    async remove(id, currentUser) {
        const role = await this.findOne(id);
        if (role.isSystem) {
            throw new common_1.ForbiddenException('Không thể xóa vai trò hệ thống');
        }
        if (role._count.userRoles > 0) {
            throw new common_1.ConflictException('Không thể xóa vai trò đang được sử dụng');
        }
        return this.prisma.role.delete({ where: { id } });
    }
    async assignPermissions(roleId, permissionIds, currentUser) {
        if (!this.isSuperAdmin(currentUser)) {
            throw new common_1.ForbiddenException('Chỉ Super Admin mới có thể phân quyền');
        }
        await this.findOne(roleId);
        await this.prisma.rolePermission.deleteMany({
            where: { roleId },
        });
        await this.prisma.rolePermission.createMany({
            data: permissionIds.map(permissionId => ({
                roleId,
                permissionId,
            })),
        });
        return this.findOne(roleId);
    }
    async addPermission(roleId, permissionId, currentUser) {
        if (!this.isSuperAdmin(currentUser)) {
            throw new common_1.ForbiddenException('Chỉ Super Admin mới có thể phân quyền');
        }
        await this.findOne(roleId);
        const permission = await this.prisma.permission.findUnique({
            where: { id: permissionId },
        });
        if (!permission) {
            throw new common_1.NotFoundException('Không tìm thấy quyền');
        }
        const existing = await this.prisma.rolePermission.findUnique({
            where: { roleId_permissionId: { roleId, permissionId } },
        });
        if (existing) {
            throw new common_1.ConflictException('Quyền này đã được gán cho vai trò');
        }
        await this.prisma.rolePermission.create({
            data: { roleId, permissionId },
        });
        return this.findOne(roleId);
    }
    async removePermission(roleId, permissionId, currentUser) {
        if (!this.isSuperAdmin(currentUser)) {
            throw new common_1.ForbiddenException('Chỉ Super Admin mới có thể phân quyền');
        }
        await this.prisma.rolePermission.deleteMany({
            where: { roleId, permissionId },
        });
        return this.findOne(roleId);
    }
    isSuperAdmin(user) {
        return user.roles.some(r => r.code === 'super_admin');
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map