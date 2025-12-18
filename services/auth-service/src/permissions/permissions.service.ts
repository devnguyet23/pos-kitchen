import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
                    constructor(private prisma: PrismaService) { }

                    async findAll(params: { module?: string }) {
                                        const { module } = params;

                                        const where: any = {};
                                        if (module) where.module = module;

                                        const data = await this.prisma.permission.findMany({
                                                            where,
                                                            orderBy: [{ module: 'asc' }, { name: 'asc' }],
                                        });

                                        // Group by module
                                        const grouped = data.reduce((acc, perm) => {
                                                            if (!acc[perm.module]) {
                                                                                acc[perm.module] = [];
                                                            }
                                                            acc[perm.module].push(perm);
                                                            return acc;
                                        }, {} as Record<string, typeof data>);

                                        return { data, grouped, total: data.length };
                    }

                    async findByModule(module: string) {
                                        return this.prisma.permission.findMany({
                                                            where: { module },
                                                            orderBy: { name: 'asc' },
                                        });
                    }

                    async getModules() {
                                        const permissions = await this.prisma.permission.findMany({
                                                            select: { module: true },
                                                            distinct: ['module'],
                                                            orderBy: { module: 'asc' },
                                        });

                                        return permissions.map(p => p.module);
                    }
}
