"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ShardManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShardManager = void 0;
const common_1 = require("@nestjs/common");
let ShardManager = ShardManager_1 = class ShardManager {
    constructor() {
        this.logger = new common_1.Logger(ShardManager_1.name);
        this.shards = [
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
        this.readReplica = {
            id: 'replica-1',
            name: 'Read Replica',
            host: process.env.DB_REPLICA_HOST || 'postgres-replica',
            port: parseInt(process.env.DB_REPLICA_PORT || '5432'),
            database: 'pos_db',
            chainIdRange: { min: 0, max: Infinity },
            isReplica: true,
        };
    }
    getShardForChain(chainId) {
        const shard = this.shards.find(s => chainId >= s.chainIdRange.min && chainId <= s.chainIdRange.max);
        if (!shard) {
            this.logger.warn(`No shard found for chainId ${chainId}, using default`);
            return this.shards[0];
        }
        this.logger.debug(`Routing chainId ${chainId} to shard ${shard.id}`);
        return shard;
    }
    getConnectionString(shard) {
        const user = process.env.DB_USER || 'postgres';
        const password = process.env.DB_PASSWORD || 'password';
        return `postgresql://${user}:${password}@${shard.host}:${shard.port}/${shard.database}`;
    }
    getReadReplica() {
        return this.readReplica;
    }
    getAllShards() {
        return [...this.shards];
    }
    getShardById(shardId) {
        return this.shards.find(s => s.id === shardId);
    }
    shouldUseReplica(queryType, forReports = false) {
        if (forReports)
            return true;
        return false;
    }
    getPgBouncerConnection() {
        const host = process.env.PGBOUNCER_HOST || 'pgbouncer';
        const port = process.env.PGBOUNCER_PORT || '6432';
        const user = process.env.DB_USER || 'postgres';
        const password = process.env.DB_PASSWORD || 'password';
        const database = 'pos_db';
        return `postgresql://${user}:${password}@${host}:${port}/${database}`;
    }
    async healthCheck() {
        const results = {};
        for (const shard of this.shards) {
            results[shard.id] = true;
        }
        results['replica'] = true;
        return results;
    }
};
exports.ShardManager = ShardManager;
exports.ShardManager = ShardManager = ShardManager_1 = __decorate([
    (0, common_1.Injectable)()
], ShardManager);
//# sourceMappingURL=shard-manager.service.js.map