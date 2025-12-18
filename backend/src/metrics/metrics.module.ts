import { Module, Global } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

/**
 * MetricsModule - Prometheus metrics collection
 * Global module for application-wide metrics
 */
@Global()
@Module({
                    controllers: [MetricsController],
                    providers: [MetricsService],
                    exports: [MetricsService],
})
export class MetricsModule { }
