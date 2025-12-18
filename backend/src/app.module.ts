import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { EventsModule } from './events/events.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReportsModule } from './reports/reports.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ModifiersModule } from './modifiers/modifiers.module';
import { CategoriesModule } from './categories/categories.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
// Permission system modules
import { ChainsModule } from './chains/chains.module';
import { StoresManagementModule } from './stores-management/stores-management.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ShiftsModule } from './shifts/shifts.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Module({
                    imports: [
                                        ServeStaticModule.forRoot({
                                                            rootPath: join(__dirname, '..', 'uploads'),
                                                            serveRoot: '/uploads',
                                        }),
                                        PrismaModule,
                                        CacheModule,  // Global Redis caching
                                        AuthModule,
                                        // Permission system modules
                                        ChainsModule,
                                        StoresManagementModule,
                                        UsersModule,
                                        RolesModule,
                                        PermissionsModule,
                                        ShiftsModule,
                                        AuditLogsModule,
                                        // Existing modules
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
