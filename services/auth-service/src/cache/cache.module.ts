import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * CacheModule - Global Redis caching module
 * Available throughout the application
 */
@Global()
@Module({
                    providers: [CacheService],
                    exports: [CacheService],
})
export class CacheModule { }
