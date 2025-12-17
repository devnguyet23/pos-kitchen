import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards';
import { RequireRoles } from '../auth/decorators';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
@RequireRoles('super_admin', 'chain_owner', 'chain_admin')
export class PermissionsController {
                    constructor(private readonly permissionsService: PermissionsService) { }

                    @Get()
                    findAll(@Query('module') module?: string) {
                                        return this.permissionsService.findAll({ module });
                    }

                    @Get('modules')
                    getModules() {
                                        return this.permissionsService.getModules();
                    }
}
