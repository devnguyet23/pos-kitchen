import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto, ResetPasswordDto } from './dto/user.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
                    constructor(private prisma: PrismaService) { }

                    async create(createUserDto: CreateUserDto, currentUser: CurrentUserData) {
                                        const { username, email, password, chainId, storeId, ...rest } = createUserDto;

                                        // Check if username exists
                                        const existingUser = await this.prisma.user.findFirst({
                                                            where: { OR: [{ username }, { email }] },
                                        });

                                        if (existingUser) {
                                                            throw new ConflictException(
                                                                                existingUser.username === username ? 'Username đã tồn tại' : 'Email đã tồn tại'
                                                            );
                                        }

                                        // Validate scope access
                                        if (chainId && !this.hasChainAccess(currentUser, chainId)) {
                                                            throw new ForbiddenException('Bạn không có quyền tạo user trong chuỗi này');
                                        }

                                        // Hash password
                                        const hashedPassword = await bcrypt.hash(password, 10);

                                        return this.prisma.user.create({
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
                    }

                    async findAll(params: {
                                        skip?: number;
                                        take?: number;
                                        search?: string;
                                        status?: string;
                                        chainId?: number;
                                        storeId?: number;
                                        roleCode?: string;
                    }, currentUser: CurrentUserData) {
                                        const { skip = 0, take = 10, search, status, chainId, storeId, roleCode } = params;

                                        const where: any = {};

                                        // Apply scope filtering
                                        if (!this.isSuperAdmin(currentUser)) {
                                                            if (currentUser.storeId) {
                                                                                where.storeId = currentUser.storeId;
                                                            } else if (currentUser.chainId) {
                                                                                where.chainId = currentUser.chainId;
                                                            }
                                        } else {
                                                            if (chainId) where.chainId = chainId;
                                                            if (storeId) where.storeId = storeId;
                                        }

                                        if (search) {
                                                            where.OR = [
                                                                                { username: { contains: search, mode: 'insensitive' } },
                                                                                { fullName: { contains: search, mode: 'insensitive' } },
                                                                                { email: { contains: search, mode: 'insensitive' } },
                                                            ];
                                        }

                                        if (status) where.status = status;

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

                    async findOne(id: number, currentUser: CurrentUserData) {
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
                                                            throw new NotFoundException('Không tìm thấy người dùng');
                                        }

                                        // Check access
                                        if (!this.hasUserAccess(currentUser, user)) {
                                                            throw new ForbiddenException('Bạn không có quyền xem thông tin người dùng này');
                                        }

                                        return user;
                    }

                    async update(id: number, updateUserDto: UpdateUserDto, currentUser: CurrentUserData) {
                                        const user = await this.findOne(id, currentUser);

                                        if (!this.canModifyUser(currentUser, user)) {
                                                            throw new ForbiddenException('Bạn không có quyền sửa thông tin người dùng này');
                                        }

                                        return this.prisma.user.update({
                                                            where: { id },
                                                            data: updateUserDto,
                                                            select: this.getUserSelect(),
                                        });
                    }

                    async remove(id: number, currentUser: CurrentUserData) {
                                        const user = await this.findOne(id, currentUser);

                                        if (!this.canModifyUser(currentUser, user)) {
                                                            throw new ForbiddenException('Bạn không có quyền xóa người dùng này');
                                        }

                                        // Prevent self-deletion
                                        if (user.id === currentUser.id) {
                                                            throw new BadRequestException('Không thể xóa chính mình');
                                        }

                                        return this.prisma.user.delete({ where: { id } });
                    }

                    async assignRole(userId: number, assignRoleDto: AssignRoleDto, currentUser: CurrentUserData) {
                                        const user = await this.findOne(userId, currentUser);
                                        const { roleId, chainId, storeId } = assignRoleDto;

                                        // Check if role exists
                                        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
                                        if (!role) {
                                                            throw new NotFoundException('Không tìm thấy vai trò');
                                        }

                                        // Validate: can only assign roles <= own level
                                        const currentUserMaxLevel = Math.min(...currentUser.roles.map(r => r.level));
                                        if (role.level < currentUserMaxLevel && !this.isSuperAdmin(currentUser)) {
                                                            throw new ForbiddenException('Bạn không thể gán vai trò cao hơn vai trò của mình');
                                        }

                                        // Delete existing role assignment if any
                                        await this.prisma.userRole.deleteMany({
                                                            where: { userId, roleId },
                                        });

                                        // Create new assignment
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

                    async removeRole(userId: number, roleId: number, currentUser: CurrentUserData) {
                                        await this.findOne(userId, currentUser);

                                        const userRole = await this.prisma.userRole.findFirst({
                                                            where: { userId, roleId, isActive: true },
                                        });

                                        if (!userRole) {
                                                            throw new NotFoundException('Người dùng không có vai trò này');
                                        }

                                        return this.prisma.userRole.update({
                                                            where: { id: userRole.id },
                                                            data: { isActive: false },
                                        });
                    }

                    async resetPassword(userId: number, resetPasswordDto: ResetPasswordDto, currentUser: CurrentUserData) {
                                        const user = await this.findOne(userId, currentUser);

                                        if (!this.canModifyUser(currentUser, user)) {
                                                            throw new ForbiddenException('Bạn không có quyền reset mật khẩu người dùng này');
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

                    async lockUser(userId: number, currentUser: CurrentUserData) {
                                        const user = await this.findOne(userId, currentUser);

                                        if (!this.canModifyUser(currentUser, user)) {
                                                            throw new ForbiddenException('Bạn không có quyền khóa người dùng này');
                                        }

                                        return this.prisma.user.update({
                                                            where: { id: userId },
                                                            data: { status: 'SUSPENDED' },
                                                            select: this.getUserSelect(),
                                        });
                    }

                    async unlockUser(userId: number, currentUser: CurrentUserData) {
                                        const user = await this.findOne(userId, currentUser);

                                        if (!this.canModifyUser(currentUser, user)) {
                                                            throw new ForbiddenException('Bạn không có quyền mở khóa người dùng này');
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

                    private getUserSelect() {
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

                    private isSuperAdmin(user: CurrentUserData): boolean {
                                        return user.roles.some(r => r.code === 'super_admin');
                    }

                    private hasChainAccess(user: CurrentUserData, chainId: number): boolean {
                                        if (this.isSuperAdmin(user)) return true;
                                        return user.chainId === chainId;
                    }

                    private hasUserAccess(currentUser: CurrentUserData, targetUser: any): boolean {
                                        if (this.isSuperAdmin(currentUser)) return true;
                                        if (currentUser.id === targetUser.id) return true;
                                        if (currentUser.chainId && currentUser.chainId === targetUser.chainId) return true;
                                        if (currentUser.storeId && currentUser.storeId === targetUser.storeId) return true;
                                        return false;
                    }

                    private canModifyUser(currentUser: CurrentUserData, targetUser: any): boolean {
                                        if (this.isSuperAdmin(currentUser)) return true;
                                        if (currentUser.roles.some(r => r.level === 2) && currentUser.chainId === targetUser.chainId) return true;
                                        if (currentUser.roles.some(r => r.level === 3) && currentUser.storeId === targetUser.storeId) return true;
                                        return false;
                    }
}
