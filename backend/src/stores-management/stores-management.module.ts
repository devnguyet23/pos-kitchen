import { Module } from '@nestjs/common';
import { StoresManagementService } from './stores-management.service';
import { StoresManagementController } from './stores-management.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
                    imports: [PrismaModule],
                    controllers: [StoresManagementController],
                    providers: [StoresManagementService],
                    exports: [StoresManagementService],
})
export class StoresManagementModule { }
