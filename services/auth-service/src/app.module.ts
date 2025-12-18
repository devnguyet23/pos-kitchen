import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ChainsModule } from './chains/chains.module';
import { StoresManagementModule } from './stores-management/stores-management.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { HealthController } from './health/health.controller';

@Module({
                    imports: [
                                        PrismaModule,
                                        CacheModule,
                                        AuthModule,
                                        UsersModule,
                                        RolesModule,
                                        PermissionsModule,
                                        ChainsModule,
                                        StoresManagementModule,
                                        AuditLogsModule,
                    ],
                    controllers: [HealthController],
})
export class AppModule { }
