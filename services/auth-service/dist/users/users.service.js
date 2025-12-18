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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto, currentUser) {
        const { username, email, password, chainId, storeId, roleId, ...rest } = createUserDto;
        const existingUser = await this.prisma.user.findFirst({
            where: { OR: [{ username }, { email }] },
        });
        if (existingUser) {
            throw new common_1.ConflictException(existingUser.username === username ? 'Username đã tồn tại' : 'Email đã tồn tại');
        }
        if (chainId && !this.hasChainAccess(currentUser, chainId)) {
            throw new common_1.ForbiddenException('Bạn không có quyền tạo user trong chuỗi này');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                chainId: chainId || currentUser.chainId,
                storeId: storeId || currentUser.storeId,
                ...rest,
            },
            select: this.getUserSelect(),
        });
        if (roleId) {
            await this.assignRole(user.id, { roleId, chainId, storeId }, currentUser);
        }
        return user;
    }
    async findAll(params, currentUser) {
        const { skip = 0, take = 10, search, status, chainId, storeId, roleCode } = params;
        const where = {};
        if (!this.isSuperAdmin(currentUser)) {
            if (currentUser.storeId) {
                where.storeId = currentUser.storeId;
            }
            else if (currentUser.chainId) {
                where.chainId = currentUser.chainId;
            }
        }
        else {
            if (chainId)
                where.chainId = chainId;
            if (storeId)
                where.storeId = storeId;
        }
        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        if (roleCode) {
            where.userRoles = {
                some: {
                    role: { code: roleCode },
                    isActive: true,
                },
            };
        }
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                select: {
                    ...this.getUserSelect(),
                    userRoles: {
                        where: { isActive: true },
                        include: { role: { select: { id: true, name: true, code: true, color: true } } },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
            totalPages: Math.ceil(total / take),
        };
    }
    async findOne(id, currentUser) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                ...this.getUserSelect(),
                chain: { select: { id: true, name: true, code: true } },
                store: { select: { id: true, name: true, code: true } },
                userRoles: {
                    where: { isActive: true },
                    include: {
                        role: {
                            include: {
                                permissions: { include: { permission: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        if (!this.hasUserAccess(currentUser, user)) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem thông tin người dùng này');
        }
        return user;
    }
    async update(id, updateUserDto, currentUser) {
        const user = await this.findOne(id, currentUser);
        if (!this.canModifyUser(currentUser, user)) {
            throw new common_1.ForbiddenException('Bạn không có quyền sửa thông tin người dùng này');
        }
        const { chainId, storeId, roleId, ...rest } = updateUserDto;
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                ...rest,
                ...(chainId !== undefined && {
                    chain: chainId ? { connect: { id: chainId } } : { disconnect: true },
                }),
                ...(storeId !== undefined && {
                    store: storeId ? { connect: { id: storeId } } : { disconnect: true },
                }),
            },
            select: this.getUserSelect(),
        });
        if (roleId) {
            await this.assignRole(id, { roleId, chainId, storeId }, currentUser);
        }
        return updatedUser;
    }
    async remove(id, currentUser) {
        const user = await this.findOne(id, currentUser);
        if (!this.canModifyUser(currentUser, user)) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa người dùng này');
        }
        if (user.id === currentUser.id) {
            throw new common_1.BadRequestException('Không thể xóa chính mình');
        }
        return this.prisma.user.delete({ where: { id } });
    }
    async assignRole(userId, assignRoleDto, currentUser) {
        const user = await this.findOne(userId, currentUser);
        const { roleId, chainId, storeId } = assignRoleDto;
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            throw new common_1.NotFoundException('Không tìm thấy vai trò');
        }
        const currentUserMaxLevel = Math.min(...currentUser.roles.map(r => r.level));
        if (role.level < currentUserMaxLevel && !this.isSuperAdmin(currentUser)) {
            throw new common_1.ForbiddenException('Bạn không thể gán vai trò cao hơn vai trò của mình');
        }
        await this.prisma.userRole.deleteMany({
            where: { userId, roleId },
        });
        return this.prisma.userRole.create({
            data: {
                userId,
                roleId,
                chainId: chainId || user.chainId,
                storeId: storeId || user.storeId,
                assignedBy: currentUser.id,
                isActive: true,
            },
            include: {
                role: { select: { id: true, name: true, code: true } },
            },
        });
    }
    async removeRole(userId, roleId, currentUser) {
        await this.findOne(userId, currentUser);
        const userRole = await this.prisma.userRole.findFirst({
            where: { userId, roleId, isActive: true },
        });
        if (!userRole) {
            throw new common_1.NotFoundException('Người dùng không có vai trò này');
        }
        return this.prisma.userRole.update({
            where: { id: userRole.id },
            data: { isActive: false },
        });
    }
    async resetPassword(userId, resetPasswordDto, currentUser) {
        const user = await this.findOne(userId, currentUser);
        if (!this.canModifyUser(currentUser, user)) {
            throw new common_1.ForbiddenException('Bạn không có quyền reset mật khẩu người dùng này');
        }
        const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                passwordChangedAt: new Date(),
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        });
        return { message: 'Reset mật khẩu thành công' };
    }
    async lockUser(userId, currentUser) {
        const user = await this.findOne(userId, currentUser);
        if (!this.canModifyUser(currentUser, user)) {
            throw new common_1.ForbiddenException('Bạn không có quyền khóa người dùng này');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { status: 'SUSPENDED' },
            select: this.getUserSelect(),
        });
    }
    async unlockUser(userId, currentUser) {
        const user = await this.findOne(userId, currentUser);
        if (!this.canModifyUser(currentUser, user)) {
            throw new common_1.ForbiddenException('Bạn không có quyền mở khóa người dùng này');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                status: 'ACTIVE',
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
            select: this.getUserSelect(),
        });
    }
    getUserSelect() {
        return {
            id: true,
            username: true,
            email: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
            chainId: true,
            storeId: true,
            status: true,
            createdAt: true,
            lastLoginAt: true,
        };
    }
    isSuperAdmin(user) {
        return user.roles.some(r => r.code === 'super_admin');
    }
    hasChainAccess(user, chainId) {
        if (this.isSuperAdmin(user))
            return true;
        return user.chainId === chainId;
    }
    hasUserAccess(currentUser, targetUser) {
        if (this.isSuperAdmin(currentUser))
            return true;
        if (currentUser.id === targetUser.id)
            return true;
        if (currentUser.chainId && currentUser.chainId === targetUser.chainId)
            return true;
        if (currentUser.storeId && currentUser.storeId === targetUser.storeId)
            return true;
        return false;
    }
    canModifyUser(currentUser, targetUser) {
        if (this.isSuperAdmin(currentUser))
            return true;
        if (currentUser.roles.some(r => r.level === 2) && currentUser.chainId === targetUser.chainId)
            return true;
        if (currentUser.roles.some(r => r.level === 3) && currentUser.storeId === targetUser.storeId)
            return true;
        return false;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map