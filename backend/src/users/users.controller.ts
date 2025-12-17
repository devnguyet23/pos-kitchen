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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto, ResetPasswordDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards';
import { RequirePermissions, CurrentUser, CurrentUserData } from '../auth/decorators';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
                    constructor(private readonly usersService: UsersService) { }

                    @Post()
                    @RequirePermissions('create_user')
                    create(
                                        @Body() createUserDto: CreateUserDto,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.usersService.create(createUserDto, user);
                    }

                    @Get()
                    @RequirePermissions('view_users', 'view_store_users')
                    findAll(
                                        @CurrentUser() user: CurrentUserData,
                                        @Query('page') page?: string,
                                        @Query('pageSize') pageSize?: string,
                                        @Query('search') search?: string,
                                        @Query('status') status?: string,
                                        @Query('chainId') chainId?: string,
                                        @Query('storeId') storeId?: string,
                                        @Query('roleCode') roleCode?: string,
                    ) {
                                        const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
                                        const take = pageSize ? parseInt(pageSize) : 10;

                                        return this.usersService.findAll(
                                                            {
                                                                                skip,
                                                                                take,
                                                                                search,
                                                                                status,
                                                                                chainId: chainId ? parseInt(chainId) : undefined,
                                                                                storeId: storeId ? parseInt(storeId) : undefined,
                                                                                roleCode,
                                                            },
                                                            user,
                                        );
                    }

                    @Get(':id')
                    @RequirePermissions('view_users', 'view_store_users')
                    findOne(
                                        @Param('id', ParseIntPipe) id: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.usersService.findOne(id, user);
                    }

                    @Patch(':id')
                    @RequirePermissions('edit_user')
                    update(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() updateUserDto: UpdateUserDto,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.usersService.update(id, updateUserDto, user);
                    }

                    @Delete(':id')
                    @RequirePermissions('delete_user')
                    remove(
                                        @Param('id', ParseIntPipe) id: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.usersService.remove(id, user);
                    }

                    @Post(':id/roles')
                    @RequirePermissions('assign_roles')
                    assignRole(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() assignRoleDto: AssignRoleDto,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.usersService.assignRole(id, assignRoleDto, user);
                    }

                    @Delete(':id/roles/:roleId')
                    @RequirePermissions('assign_roles')
                    removeRole(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Param('roleId', ParseIntPipe) roleId: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.usersService.removeRole(id, roleId, user);
                    }

                    @Post(':id/reset-password')
                    @RequirePermissions('reset_password')
                    resetPassword(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() resetPasswordDto: ResetPasswordDto,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.usersService.resetPassword(id, resetPasswordDto, user);
                    }

                    @Post(':id/lock')
                    @RequirePermissions('lock_unlock_user')
                    lockUser(
                                        @Param('id', ParseIntPipe) id: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.usersService.lockUser(id, user);
                    }

                    @Post(':id/unlock')
                    @RequirePermissions('lock_unlock_user')
                    unlockUser(
                                        @Param('id', ParseIntPipe) id: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.usersService.unlockUser(id, user);
                    }
}
