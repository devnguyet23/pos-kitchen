import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ShiftsService {
                    constructor(private prisma: PrismaService) { }

                    async openShift(data: { openingCash: number }, user: CurrentUserData) {
                                        if (!user.storeId) {
                                                            throw new ForbiddenException('Bạn cần thuộc về một cửa hàng để mở ca');
                                        }

                                        // Check if user already has an open shift
                                        const existingShift = await this.prisma.shift.findFirst({
                                                            where: {
                                                                                userId: user.id,
                                                                                status: 'OPEN',
                                                            },
                                        });

                                        if (existingShift) {
                                                            throw new ConflictException('Bạn đang có ca làm việc đang mở');
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

                    async closeShift(
                                        id: number,
                                        data: { closingCash: number; note?: string },
                                        user: CurrentUserData,
                    ) {
                                        const shift = await this.findOne(id, user);

                                        if (shift.status === 'CLOSED') {
                                                            throw new ConflictException('Ca này đã được đóng');
                                        }

                                        // Only owner of shift or manager can close
                                        if (shift.userId !== user.id && !this.canCloseOtherShift(user)) {
                                                            throw new ForbiddenException('Bạn không có quyền đóng ca này');
                                        }

                                        const expectedCash = new Decimal(shift.openingCash).add(shift.totalSales).sub(shift.totalRefunds);
                                        const cashDifference = new Decimal(data.closingCash).sub(expectedCash);

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

                    async findAll(params: { skip?: number; take?: number; storeId?: number; status?: string; userId?: number }, user: CurrentUserData) {
                                        const { skip = 0, take = 10, storeId, status, userId } = params;

                                        const where: any = {};

                                        // Scope filtering
                                        if (!this.isSuperAdmin(user)) {
                                                            if (user.storeId) {
                                                                                where.storeId = user.storeId;
                                                            } else if (user.chainId) {
                                                                                where.store = { chainId: user.chainId };
                                                            }
                                        } else if (storeId) {
                                                            where.storeId = storeId;
                                        }

                                        if (status) where.status = status;
                                        if (userId) where.userId = userId;

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

                    async findOne(id: number, user: CurrentUserData) {
                                        const shift = await this.prisma.shift.findUnique({
                                                            where: { id },
                                                            include: {
                                                                                user: { select: { id: true, fullName: true, username: true } },
                                                                                store: { select: { id: true, name: true, code: true, chainId: true } },
                                                                                closedByUser: { select: { id: true, fullName: true, username: true } },
                                                            },
                                        });

                                        if (!shift) {
                                                            throw new NotFoundException('Không tìm thấy ca làm việc');
                                        }

                                        // Check access
                                        if (!this.hasShiftAccess(user, shift)) {
                                                            throw new ForbiddenException('Bạn không có quyền xem ca làm việc này');
                                        }

                                        return shift;
                    }

                    async getCurrentShift(user: CurrentUserData) {
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

                    async getMyShifts(user: CurrentUserData, params: { skip?: number; take?: number }) {
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

                    private isSuperAdmin(user: CurrentUserData): boolean {
                                        return user.roles.some(r => r.code === 'super_admin');
                    }

                    private canCloseOtherShift(user: CurrentUserData): boolean {
                                        return user.permissions.includes('close_others_shift');
                    }

                    private hasShiftAccess(user: CurrentUserData, shift: any): boolean {
                                        if (this.isSuperAdmin(user)) return true;
                                        if (shift.userId === user.id) return true;
                                        if (user.storeId && user.storeId === shift.storeId) return true;
                                        if (user.chainId && shift.store?.chainId === user.chainId) return true;
                                        return false;
                    }
}
