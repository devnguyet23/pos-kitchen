import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from './metrics.service';

/**
 * MetricsController - Exposes /metrics endpoint for Prometheus
 */
@Controller('metrics')
export class MetricsController {
                    constructor(private readonly metricsService: MetricsService) { }

                    @Get()
                    async getMetrics(@Res() res: Response): Promise<void> {
                                        const metrics = await this.metricsService.getMetrics();
                                        res.set('Content-Type', this.metricsService.getContentType());
                                        res.send(metrics);
                    }
}
