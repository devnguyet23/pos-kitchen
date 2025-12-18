import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
                    const logger = new Logger('Gateway');

                    // Create app WITHOUT body-parser (we'll add it selectively)
                    const app = await NestFactory.create(AppModule, {
                                        bodyParser: false, // Disable default body parser to allow proxy middleware to work
                    });

                    // Enable CORS
                    app.enableCors({
                                        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                                        credentials: true,
                    });

                    // Only parse body for non-proxied routes (like /health)
                    // The proxy middleware will handle streaming the body to upstream services
                    app.use('/health', bodyParser.json());
                    app.use('/health', bodyParser.urlencoded({ extended: true }));

                    const port = process.env.PORT || 3001;
                    await app.listen(port);

                    logger.log(`🚀 API Gateway running on http://localhost:${port}`);
                    logger.log(`📡 Auth Service: ${process.env.AUTH_SERVICE_URL || 'http://localhost:3002'}`);
                    logger.log(`📡 POS Service: ${process.env.POS_SERVICE_URL || 'http://localhost:3003'}`);
                    logger.log(`📡 Report Service: ${process.env.REPORT_SERVICE_URL || 'http://localhost:3004'}`);
}

bootstrap();
