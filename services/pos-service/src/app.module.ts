import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ModifiersModule } from './modifiers/modifiers.module';
import { OrdersModule } from './orders/orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { EventsModule } from './events/events.module';
import { ShiftsModule } from './shifts/shifts.module';
import { UploadModule } from './upload/upload.module';
import { HealthController } from './health/health.controller';

@Module({
                    imports: [
                                        ServeStaticModule.forRoot({
                                                            rootPath: join(__dirname, '..', 'uploads'),
                                                            serveRoot: '/uploads',
                                        }),
                                        PrismaModule,
                                        CacheModule,
                                        AuthModule,  // For JWT validation
                                        // POS modules
                                        ProductsModule,
                                        CategoriesModule,
                                        ModifiersModule,
                                        OrdersModule,
                                        InvoicesModule,
                                        EventsModule,
                                        ShiftsModule,
                                        UploadModule,
                    ],
                    controllers: [HealthController],
})
export class AppModule { }
