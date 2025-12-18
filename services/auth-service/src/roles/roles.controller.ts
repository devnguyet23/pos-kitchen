import {
                    Controller,
                    Get,
                    Post,
                    Body,
                    Patch,
                    Param,
                    Delete,
                    Query,
                    ParseIntPipe,
                    UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards';
import { RequirePermissions, RequireRoles, CurrentUser, CurrentUserData } from '../auth/decorators';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
                    constructor(private readonly rolesService: RolesService) { }

                    @Get()
                    @RequirePermissions('view_users')
                    findAll(@Query('level') level?: string) {
                                        return this.rolesService.findAll({
                                                            level: level ? parseInt(level) : undefined,
                                        });
                    }

                    @Get(':id')
                    @RequirePermissions('view_users')
                    findOne(@Param('id', ParseIntPipe) id: number) {
                                        return this.rolesService.findOne(id);
                    }

                    @Post()
                    @RequireRoles('super_admin')
                    create(
                                        @Body() data: { name: string; code: string; level: number; description?: string; color?: string },
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.rolesService.create(data, user);
                    }

                    @Patch(':id')
                    @RequireRoles('super_admin')
                    update(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() data: { name?: string; description?: string; color?: string },
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.rolesService.update(id, data, user);
                    }

                    @Delete(':id')
                    @RequireRoles('super_admin')
                    remove(
                                        @Param('id', ParseIntPipe) id: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.rolesService.remove(id, user);
                    }

                    @Post(':id/permissions')
                    @RequireRoles('super_admin')
                    assignPermissions(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() data: { permissionIds: number[] },
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.rolesService.assignPermissions(id, data.permissionIds, user);
                    }

                    @Post(':id/permissions/:permissionId')
                    @RequireRoles('super_admin')
                    addPermission(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Param('permissionId', ParseIntPipe) permissionId: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.rolesService.addPermission(id, permissionId, user);
                    }

                    @Delete(':id/permissions/:permissionId')
                    @RequireRoles('super_admin')
                    removePermission(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Param('permissionId', ParseIntPipe) permissionId: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.rolesService.removePermission(id, permissionId, user);
                    }
}
