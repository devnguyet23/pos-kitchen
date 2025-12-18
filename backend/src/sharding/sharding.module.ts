import { Module, Global } from '@nestjs/common';
import { ShardManager } from './shard-manager.service';

/**
 * ShardingModule - Database sharding management
 * Global module available throughout the application
 */
@Global()
@Module({
                    providers: [ShardManager],
                    exports: [ShardManager],
})
export class ShardingModule { }
