import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/guards';
import { RequirePermissions, CurrentUser, CurrentUserData } from '../auth/decorators';

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
                    constructor(private readonly shiftsService: ShiftsService) { }

                    @Post('open')
                    @RequirePermissions('open_shift')
                    openShift(
                                        @Body() data: { openingCash: number },
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.shiftsService.openShift(data, user);
                    }

                    @Post(':id/close')
                    @RequirePermissions('close_shift')
                    closeShift(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() data: { closingCash: number; note?: string },
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.shiftsService.closeShift(id, data, user);
                    }

                    @Get()
                    @RequirePermissions('view_shifts', 'view_own_shifts')
                    findAll(
                                        @CurrentUser() user: CurrentUserData,
                                        @Query('page') page?: string,
                                        @Query('pageSize') pageSize?: string,
                                        @Query('storeId') storeId?: string,
                                        @Query('status') status?: string,
                                        @Query('userId') userId?: string,
                    ) {
                                        const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
                                        const take = pageSize ? parseInt(pageSize) : 10;

                                        return this.shiftsService.findAll(
                                                            {
                                                                                skip,
                                                                                take,
                                                                                storeId: storeId ? parseInt(storeId) : undefined,
                                                                                status,
                                                                                userId: userId ? parseInt(userId) : undefined,
                                                            },
                                                            user,
                                        );
                    }

                    @Get('current')
                    @RequirePermissions('open_shift', 'close_shift')
                    getCurrentShift(@CurrentUser() user: CurrentUserData) {
                                        return this.shiftsService.getCurrentShift(user);
                    }

                    @Get('my')
                    @RequirePermissions('view_own_shifts')
                    getMyShifts(
                                        @CurrentUser() user: CurrentUserData,
                                        @Query('page') page?: string,
                                        @Query('pageSize') pageSize?: string,
                    ) {
                                        const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
                                        const take = pageSize ? parseInt(pageSize) : 10;

                                        return this.shiftsService.getMyShifts(user, { skip, take });
                    }

                    @Get(':id')
                    @RequirePermissions('view_shifts', 'view_own_shifts')
                    findOne(
                                        @Param('id', ParseIntPipe) id: number,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.shiftsService.findOne(id, user);
                    }
}
