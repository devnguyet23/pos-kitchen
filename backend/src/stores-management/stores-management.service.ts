import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';

@Injectable()
export class StoresManagementService {
                    constructor(private prisma: PrismaService) { }

                    async create(createStoreDto: CreateStoreDto, user: CurrentUserData) {
                                        // Check if code already exists
                                        const existing = await this.prisma.store.findUnique({
                                                            where: { code: createStoreDto.code },
                                        });

                                        if (existing) {
                                                            throw new ConflictException('Mã cửa hàng đã tồn tại');
                                        }

                                        // Check if user has access to this chain
                                        if (!this.hasChainAccess(user, createStoreDto.chainId)) {
                                                            throw new ForbiddenException('Bạn không có quyền tạo cửa hàng trong chuỗi này');
                                        }

                                        return this.prisma.store.create({
                                                            data: createStoreDto,
                                                            include: {
                                                                                chain: { select: { id: true, name: true, code: true } },
                                                            },
                                        });
                    }

                    async findAll(params: {
                                        skip?: number;
                                        take?: number;
                                        search?: string;
                                        status?: string;
                                        chainId?: number;
                    }, user: CurrentUserData) {
                                        const { skip = 0, take = 10, search, status, chainId } = params;

                                        const where: any = {};

                                        // Apply scope filtering
                                        if (!this.isSuperAdmin(user)) {
                                                            if (user.chainId) {
                                                                                where.chainId = user.chainId;
                                                            }
                                                            if (user.storeId) {
                                                                                where.id = user.storeId;
                                                            }
                                        } else if (chainId) {
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

                    async findOne(id: number, user: CurrentUserData) {
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
                                                            throw new NotFoundException('Không tìm thấy cửa hàng');
                                        }

                                        // Check access
                                        if (!this.hasStoreAccess(user, store.id, store.chainId)) {
                                                            throw new ForbiddenException('Bạn không có quyền truy cập cửa hàng này');
                                        }

                                        return store;
                    }

                    async update(id: number, updateStoreDto: UpdateStoreDto, user: CurrentUserData) {
                                        const store = await this.findOne(id, user);

                                        if (!this.hasChainAccess(user, store.chainId)) {
                                                            throw new ForbiddenException('Bạn không có quyền sửa cửa hàng này');
                                        }

                                        return this.prisma.store.update({
                                                            where: { id },
                                                            data: updateStoreDto,
                                                            include: {
                                                                                chain: { select: { id: true, name: true, code: true } },
                                                            },
                                        });
                    }

                    async remove(id: number, user: CurrentUserData) {
                                        const store = await this.findOne(id, user);

                                        if (!this.hasChainAccess(user, store.chainId)) {
                                                            throw new ForbiddenException('Bạn không có quyền xóa cửa hàng này');
                                        }

                                        // Check if store has users
                                        if (store._count.users > 0) {
                                                            throw new ConflictException('Không thể xóa cửa hàng đang có nhân viên');
                                        }

                                        return this.prisma.store.delete({
                                                            where: { id },
                                        });
                    }

                    async getStats(id: number, user: CurrentUserData) {
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

                    private isSuperAdmin(user: CurrentUserData): boolean {
                                        return user.roles.some(r => r.code === 'super_admin');
                    }

                    private hasChainAccess(user: CurrentUserData, chainId: number): boolean {
                                        if (this.isSuperAdmin(user)) return true;
                                        return user.chainId === chainId || user.roles.some(r => r.chainId === chainId);
                    }

                    private hasStoreAccess(user: CurrentUserData, storeId: number, chainId: number): boolean {
                                        if (this.isSuperAdmin(user)) return true;
                                        if (this.hasChainAccess(user, chainId)) return true;
                                        return user.storeId === storeId;
                    }
}
