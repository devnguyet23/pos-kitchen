import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
                    const logger = new Logger('Gateway');
                    const app = await NestFactory.create(AppModule);

                    // Enable CORS
                    app.enableCors({
                                        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                                        credentials: true,
                    });

                    const port = process.env.PORT || 3001;
                    await app.listen(port);

                    logger.log(`🚀 API Gateway running on http://localhost:${port}`);
                    logger.log(`📡 Auth Service: ${process.env.AUTH_SERVICE_URL || 'http://localhost:3002'}`);
                    logger.log(`📡 POS Service: ${process.env.POS_SERVICE_URL || 'http://localhost:3003'}`);
}

bootstrap();
