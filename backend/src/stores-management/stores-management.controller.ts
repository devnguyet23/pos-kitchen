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
import { StoresManagementService } from './stores-management.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { JwtAuthGuard } from '../auth/guards';
import { RequirePermissions, CurrentUser, CurrentUserData } from '../auth/decorators';

@Controller('stores-management')
@UseGuards(JwtAuthGuard)
export class StoresManagementController {
                    constructor(private readonly storesService: StoresManagementService) { }

                    @Post()
                    @RequirePermissions('create_store')
                    create(
                                        @Body() createStoreDto: CreateStoreDto,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.storesService.create(createStoreDto, user);
                    }

                    @Get()
                    @RequirePermissions('view_stores', 'view_own_store')
                    findAll(
                                        @CurrentUser() user: CurrentUserData,
                                        @Query('page') page?: string,
                                        @Query('pageSize') pageSize?: string,
                                        @Query('search') search?: string,
                                        @Query('status') status?: string,
                                        @Query('chainId') chainId?: string,
                    ) {
                                        const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
                                        const take = pageSize ? parseInt(pageSize) : 10;

                                        return this.storesService.findAll(
                                                            { skip, take, search, status, chainId: chainId ? parseInt(chainId) : undefined },
                                                            user,
                                        );
                    }

                    @Get(':id')
                    @RequirePermissions('view_stores', 'view_own_store')
                    findOne(
                                        @Param('id', ParseIntPipe) id: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.storesService.findOne(id, user);
                    }

                    @Get(':id/stats')
                    @RequirePermissions('view_stores', 'view_own_store')
                    getStats(
                                        @Param('id', ParseIntPipe) id: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.storesService.getStats(id, user);
                    }

                    @Patch(':id')
                    @RequirePermissions('edit_store')
                    update(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() updateStoreDto: UpdateStoreDto,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.storesService.update(id, updateStoreDto, user);
                    }

                    @Delete(':id')
                    @RequirePermissions('delete_store')
                    remove(
                                        @Param('id', ParseIntPipe) id: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.storesService.remove(id, user);
                    }
}
