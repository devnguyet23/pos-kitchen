import { Controller, Post, Get, Body, Query, Param, ParseIntPipe } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
export class InvoicesController {
                    constructor(private readonly invoicesService: InvoicesService) { }

                    @Post()
                    create(@Body() createInvoiceDto: CreateInvoiceDto) {
                                        return this.invoicesService.create(createInvoiceDto);
                    }

                    @Get()
                    findAll(@Query('from') from?: string, @Query('to') to?: string) {
                                        return this.invoicesService.findAll(from, to);
                    }

                    @Get(':id')
                    findOne(@Param('id', ParseIntPipe) id: number) {
                                        return this.invoicesService.findOne(id);
                    }
}
