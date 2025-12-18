import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Controller('health')
export class HealthController {
                    constructor(
                                        private prisma: PrismaService,
                                        private cacheService: CacheService,
                    ) { }

                    @Get()
                    async getHealth() {
                                        const dbHealth = await this.prisma.healthCheck();
                                        const cacheHealth = await this.cacheService.healthCheck();

                                        return {
                                                            status: dbHealth ? 'healthy' : 'degraded',
                                                            service: process.env.SERVICE_NAME || 'pos-backend',
                                                            version: '1.0.0',
                                                            uptime: process.uptime(),
                                                            timestamp: new Date().toISOString(),
                                                            dependencies: {
                                                                                database: dbHealth ? 'connected' : 'disconnected',
                                                                                redis: cacheHealth.status,
                                                            },
                                        };
                    }

                    @Get('live')
                    getLiveness() {
                                        return {
                                                            status: 'ok',
                                                            timestamp: new Date().toISOString(),
                                        };
                    }

                    @Get('ready')
                    async getReadiness() {
                                        const dbHealth = await this.prisma.healthCheck();

                                        return {
                                                            status: dbHealth ? 'ready' : 'not_ready',
                                                            timestamp: new Date().toISOString(),
                                        };
                    }
}
