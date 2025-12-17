import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
                    constructor(private readonly ordersService: OrdersService) { }

                    @Post()
                    @RequirePermissions('create_order')
                    create(
                                        @Body() createOrderDto: CreateOrderDto,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.ordersService.create(createOrderDto, user);
                    }

                    @Get()
                    @RequirePermissions('view_orders')
                    findAll(@CurrentUser() user: CurrentUserData) {
                                        return this.ordersService.findAll(user);
                    }
}
