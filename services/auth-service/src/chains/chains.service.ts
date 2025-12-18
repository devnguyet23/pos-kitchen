import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChainDto, UpdateChainDto } from './dto/chain.dto';

@Injectable()
export class ChainsService {
                    constructor(private prisma: PrismaService) { }

                    async create(createChainDto: CreateChainDto) {
                                        // Check if code already exists
                                        const existing = await this.prisma.chain.findUnique({
                                                            where: { code: createChainDto.code },
                                        });

                                        if (existing) {
                                                            throw new ConflictException('Mã chuỗi đã tồn tại');
                                        }

                                        return this.prisma.chain.create({
                                                            data: createChainDto,
                                        });
                    }

                    async findAll(params: {
                                        skip?: number;
                                        take?: number;
                                        search?: string;
                                        status?: string;
                    }) {
                                        const { skip = 0, take = 10, search, status } = params;

                                        const where: any = {};

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

                    async findOne(id: number) {
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
                                                            throw new NotFoundException('Không tìm thấy chuỗi');
                                        }

                                        return chain;
                    }

                    async update(id: number, updateChainDto: UpdateChainDto) {
                                        await this.findOne(id); // Check existence

                                        return this.prisma.chain.update({
                                                            where: { id },
                                                            data: updateChainDto,
                                        });
                    }

                    async remove(id: number) {
                                        const chain = await this.findOne(id);

                                        // Check if chain has stores
                                        if (chain._count.stores > 0) {
                                                            throw new ConflictException('Không thể xóa chuỗi đang có cửa hàng');
                                        }

                                        return this.prisma.chain.delete({
                                                            where: { id },
                                        });
                    }

                    async getStats(id: number) {
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
}
