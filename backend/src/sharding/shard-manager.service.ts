import { Injectable, Logger } from '@nestjs/common';

/**
 * Shard configuration for a database shard
 */
export interface ShardConfig {
                    id: string;
                    name: string;
                    host: string;
                    port: number;
                    database: string;
                    chainIdRange: {
                                        min: number;
                                        max: number;
                    };
                    isReplica?: boolean;
}

/**
 * ShardManager - Routes queries to appropriate database shards
 * 
 * Sharding Strategy:
 * - Shard by chainId (catalog-based sharding)
 * - Each shard handles a range of chainIds
 * - Read replicas for heavy read operations (reports)
 */
@Injectable()
export class ShardManager {
                    private readonly logger = new Logger(ShardManager.name);

                    // Shard configuration - in production, load from config/DB
                    private readonly shards: ShardConfig[] = [
                                        {
                                                            id: 'shard-1',
                                                            name: 'Primary Shard',
                                                            host: process.env.DB_SHARD_1_HOST || 'postgres',
                                                            port: parseInt(process.env.DB_SHARD_1_PORT || '5432'),
                                                            database: 'pos_db',
                                                            chainIdRange: { min: 1, max: 500 },
                                        },
                                        {
                                                            id: 'shard-2',
                                                            name: 'Secondary Shard',
                                                            host: process.env.DB_SHARD_2_HOST || 'postgres',
                                                            port: parseInt(process.env.DB_SHARD_2_PORT || '5432'),
                                                            database: 'pos_db_shard2',
                                                            chainIdRange: { min: 501, max: 1000 },
                                        },
                    ];

                    // Read replica configuration
                    private readonly readReplica: ShardConfig = {
                                        id: 'replica-1',
                                        name: 'Read Replica',
                                        host: process.env.DB_REPLICA_HOST || 'postgres-replica',
                                        port: parseInt(process.env.DB_REPLICA_PORT || '5432'),
                                        database: 'pos_db',
                                        chainIdRange: { min: 0, max: Infinity },
                                        isReplica: true,
                    };

                    /**
                     * Get the appropriate shard for a given chainId
                     */
                    getShardForChain(chainId: number): ShardConfig {
                                        const shard = this.shards.find(
                                                            s => chainId >= s.chainIdRange.min && chainId <= s.chainIdRange.max
                                        );

                                        if (!shard) {
                                                            this.logger.warn(`No shard found for chainId ${chainId}, using default`);
                                                            return this.shards[0];
                                        }

                                        this.logger.debug(`Routing chainId ${chainId} to shard ${shard.id}`);
                                        return shard;
                    }

                    /**
                     * Get connection string for a shard
                     */
                    getConnectionString(shard: ShardConfig): string {
                                        const user = process.env.DB_USER || 'postgres';
                                        const password = process.env.DB_PASSWORD || 'password';
                                        return `postgresql://${user}:${password}@${shard.host}:${shard.port}/${shard.database}`;
                    }

                    /**
                     * Get read replica for heavy read operations
                     */
                    getReadReplica(): ShardConfig {
                                        return this.readReplica;
                    }

                    /**
                     * Get all shards for cross-shard queries
                     */
                    getAllShards(): ShardConfig[] {
                                        return [...this.shards];
                    }

                    /**
                     * Get shard by ID
                     */
                    getShardById(shardId: string): ShardConfig | undefined {
                                        return this.shards.find(s => s.id === shardId);
                    }

                    /**
                     * Check if a query should use read replica
                     * Based on the query type and load
                     */
                    shouldUseReplica(queryType: 'read' | 'write', forReports = false): boolean {
                                        // Always use replica for reports
                                        if (forReports) return true;

                                        // For regular reads, could add load balancing logic here
                                        return false;
                    }

                    /**
                     * Get PgBouncer connection string
                     */
                    getPgBouncerConnection(): string {
                                        const host = process.env.PGBOUNCER_HOST || 'pgbouncer';
                                        const port = process.env.PGBOUNCER_PORT || '6432';
                                        const user = process.env.DB_USER || 'postgres';
                                        const password = process.env.DB_PASSWORD || 'password';
                                        const database = 'pos_db';

                                        return `postgresql://${user}:${password}@${host}:${port}/${database}`;
                    }

                    /**
                     * Health check for all shards
                     */
                    async healthCheck(): Promise<{ [shardId: string]: boolean }> {
                                        const results: { [shardId: string]: boolean } = {};

                                        for (const shard of this.shards) {
                                                            // In production, actually ping the database
                                                            results[shard.id] = true;
                                        }

                                        results['replica'] = true;

                                        return results;
                    }
}
