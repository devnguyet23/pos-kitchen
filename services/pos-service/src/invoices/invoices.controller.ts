import { Controller, Post, Get, Body, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
                    constructor(private readonly invoicesService: InvoicesService) { }

                    @Post()
                    @RequirePermissions('print_invoice')
                    create(
                                        @Body() createInvoiceDto: CreateInvoiceDto,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.invoicesService.create(createInvoiceDto, user);
                    }

                    @Get()
                    @RequirePermissions('view_orders')
                    findAll(
                                        @Query('from') from?: string,
                                        @Query('to') to?: string,
                                        @CurrentUser() user?: CurrentUserData,
                    ) {
                                        return this.invoicesService.findAll(from, to, user);
                    }

                    @Get(':id')
                    @RequirePermissions('view_orders')
                    findOne(@Param('id', ParseIntPipe) id: number) {
                                        return this.invoicesService.findOne(id);
                    }
}
