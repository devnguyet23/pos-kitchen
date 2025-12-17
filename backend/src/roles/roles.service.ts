import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';

@Injectable()
export class RolesService {
                    constructor(private prisma: PrismaService) { }

                    async findAll(params: { skip?: number; take?: number; level?: number }) {
                                        const { skip = 0, take = 20, level } = params;

                                        const where: any = {};
                                        if (level) where.level = level;

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

                    async findOne(id: number) {
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
                                                            throw new NotFoundException('Không tìm thấy vai trò');
                                        }

                                        return role;
                    }

                    async create(data: { name: string; code: string; level: number; description?: string; color?: string }, currentUser: CurrentUserData) {
                                        // Only super_admin can create roles
                                        if (!this.isSuperAdmin(currentUser)) {
                                                            throw new ForbiddenException('Chỉ Super Admin mới có thể tạo vai trò');
                                        }

                                        // Check code uniqueness
                                        const existing = await this.prisma.role.findUnique({
                                                            where: { code: data.code },
                                        });

                                        if (existing) {
                                                            throw new ConflictException('Mã vai trò đã tồn tại');
                                        }

                                        return this.prisma.role.create({
                                                            data: {
                                                                                ...data,
                                                                                isSystem: false,
                                                            },
                                        });
                    }

                    async update(id: number, data: { name?: string; description?: string; color?: string }, currentUser: CurrentUserData) {
                                        const role = await this.findOne(id);

                                        if (role.isSystem && !this.isSuperAdmin(currentUser)) {
                                                            throw new ForbiddenException('Không thể sửa vai trò hệ thống');
                                        }

                                        return this.prisma.role.update({
                                                            where: { id },
                                                            data,
                                        });
                    }

                    async remove(id: number, currentUser: CurrentUserData) {
                                        const role = await this.findOne(id);

                                        if (role.isSystem) {
                                                            throw new ForbiddenException('Không thể xóa vai trò hệ thống');
                                        }

                                        if (role._count.userRoles > 0) {
                                                            throw new ConflictException('Không thể xóa vai trò đang được sử dụng');
                                        }

                                        return this.prisma.role.delete({ where: { id } });
                    }

                    async assignPermissions(roleId: number, permissionIds: number[], currentUser: CurrentUserData) {
                                        if (!this.isSuperAdmin(currentUser)) {
                                                            throw new ForbiddenException('Chỉ Super Admin mới có thể phân quyền');
                                        }

                                        await this.findOne(roleId);

                                        // Remove existing permissions
                                        await this.prisma.rolePermission.deleteMany({
                                                            where: { roleId },
                                        });

                                        // Add new permissions
                                        await this.prisma.rolePermission.createMany({
                                                            data: permissionIds.map(permissionId => ({
                                                                                roleId,
                                                                                permissionId,
                                                            })),
                                        });

                                        return this.findOne(roleId);
                    }

                    async addPermission(roleId: number, permissionId: number, currentUser: CurrentUserData) {
                                        if (!this.isSuperAdmin(currentUser)) {
                                                            throw new ForbiddenException('Chỉ Super Admin mới có thể phân quyền');
                                        }

                                        await this.findOne(roleId);

                                        // Check if permission exists
                                        const permission = await this.prisma.permission.findUnique({
                                                            where: { id: permissionId },
                                        });

                                        if (!permission) {
                                                            throw new NotFoundException('Không tìm thấy quyền');
                                        }

                                        // Check if already assigned
                                        const existing = await this.prisma.rolePermission.findUnique({
                                                            where: { roleId_permissionId: { roleId, permissionId } },
                                        });

                                        if (existing) {
                                                            throw new ConflictException('Quyền này đã được gán cho vai trò');
                                        }

                                        await this.prisma.rolePermission.create({
                                                            data: { roleId, permissionId },
                                        });

                                        return this.findOne(roleId);
                    }

                    async removePermission(roleId: number, permissionId: number, currentUser: CurrentUserData) {
                                        if (!this.isSuperAdmin(currentUser)) {
                                                            throw new ForbiddenException('Chỉ Super Admin mới có thể phân quyền');
                                        }

                                        await this.prisma.rolePermission.deleteMany({
                                                            where: { roleId, permissionId },
                                        });

                                        return this.findOne(roleId);
                    }

                    private isSuperAdmin(user: CurrentUserData): boolean {
                                        return user.roles.some(r => r.code === 'super_admin');
                    }
}
