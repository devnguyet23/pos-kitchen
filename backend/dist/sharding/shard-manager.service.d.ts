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
export declare class ShardManager {
    private readonly logger;
    private readonly shards;
    private readonly readReplica;
    getShardForChain(chainId: number): ShardConfig;
    getConnectionString(shard: ShardConfig): string;
    getReadReplica(): ShardConfig;
    getAllShards(): ShardConfig[];
    getShardById(shardId: string): ShardConfig | undefined;
    shouldUseReplica(queryType: 'read' | 'write', forReports?: boolean): boolean;
    getPgBouncerConnection(): string;
    healthCheck(): Promise<{
        [shardId: string]: boolean;
    }>;
}
