import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ProxyMiddleware } from './middleware/proxy.middleware';
import { HealthController } from './health/health.controller';

@Module({
                    controllers: [HealthController],
                    providers: [ProxyMiddleware],
})
export class AppModule implements NestModule {
                    configure(consumer: MiddlewareConsumer) {
                                        // Apply proxy middleware to all routes except health
                                        consumer
                                                            .apply(ProxyMiddleware)
                                                            .exclude('health', 'health/(.*)')
                                                            .forRoutes('*');
                    }
}
