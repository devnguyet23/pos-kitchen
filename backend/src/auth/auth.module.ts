import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard, PermissionsGuard, ScopeGuard } from './guards';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
                    imports: [
                                        PrismaModule,
                                        JwtModule.register({
                                                            global: true,
                                                            secret: process.env.JWT_SECRET || 'pos-system-secret-key-change-in-production',
                                                            signOptions: { expiresIn: '1d' },
                                        }),
                    ],
                    controllers: [AuthController],
                    providers: [
                                        AuthService,
                                        // Global guards - applied to all routes
                                        // Uncomment below to enable auth globally
                                        // {
                                        //   provide: APP_GUARD,
                                        //   useClass: JwtAuthGuard,
                                        // },
                                        // {
                                        //   provide: APP_GUARD,
                                        //   useClass: PermissionsGuard,
                                        // },
                    ],
                    exports: [AuthService, JwtModule],
})
export class AuthModule { }
