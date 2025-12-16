import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReportsModule } from './reports/reports.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ModifiersModule } from './modifiers/modifiers.module';
import { CategoriesModule } from './categories/categories.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';

@Module({
                    imports: [
                                        ServeStaticModule.forRoot({
                                                            rootPath: join(__dirname, '..', 'uploads'),
                                                            serveRoot: '/uploads',
                                        }),
                                        PrismaModule,
                                        AuthModule,
                                        EventsModule,
                                        InvoicesModule,
                                        ReportsModule,
                                        ProductsModule,
                                        OrdersModule,
                                        ModifiersModule,
                                        CategoriesModule,
                                        UploadModule,
                    ],
})
export class AppModule { }

