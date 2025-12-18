import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
                    const logger = new Logger('AuthService');
                    const app = await NestFactory.create(AppModule);

                    // Global validation pipe
                    app.useGlobalPipes(
                                        new ValidationPipe({
                                                            whitelist: true,
                                                            transform: true,
                                                            forbidNonWhitelisted: true,
                                        }),
                    );

                    // Enable CORS for Gateway
                    app.enableCors({
                                        origin: [
                                                            process.env.GATEWAY_URL || 'http://localhost:3001',
                                                            'http://localhost:3000',
                                        ],
                                        credentials: true,
                    });

                    const port = process.env.PORT || 3002;
                    await app.listen(port);

                    logger.log(`🔐 Auth Service running on http://localhost:${port}`);
}

bootstrap();
