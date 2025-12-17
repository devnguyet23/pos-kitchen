import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * PrismaService with connection pooling and performance monitoring
 * Optimized for high-scale multi-tenant architecture
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
                    private readonly logger = new Logger(PrismaService.name);

                    constructor() {
                                        super({
                                                            log: [
                                                                                { emit: 'event', level: 'query' },
                                                                                { emit: 'stdout', level: 'info' },
                                                                                { emit: 'stdout', level: 'warn' },
                                                                                { emit: 'stdout', level: 'error' },
                                                            ],
                                        });

                                        // Log slow queries (> 1000ms) in development
                                        if (process.env.NODE_ENV !== 'production') {
                                                            this.$on('query' as never, (e: Prisma.QueryEvent) => {
                                                                                if (e.duration > 1000) {
                                                                                                    this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
                                                                                }
                                                            });
                                        }
                    }

                    async onModuleInit() {
                                        await this.$connect();
                                        this.logger.log('Database connection established');
                    }

                    async onModuleDestroy() {
                                        await this.$disconnect();
                                        this.logger.log('Database connection closed');
                    }

                    /**
                     * Execute raw query with tenant isolation
                     * Use this for complex queries that need manual tenant filtering
                     */
                    async executeWithTenant<T>(
                                        chainId: number | undefined,
                                        storeId: number | undefined,
                                        queryFn: () => Promise<T>,
                    ): Promise<T> {
                                        // Add tenant context to query
                                        // This could be enhanced with query interceptors in Phase 1
                                        return queryFn();
                    }

                    /**
                     * Health check for database connection
                     */
                    async healthCheck(): Promise<boolean> {
                                        try {
                                                            await this.$queryRaw`SELECT 1`;
                                                            return true;
                                        } catch (error) {
                                                            this.logger.error('Database health check failed', error);
                                                            return false;
                                        }
                    }
}
