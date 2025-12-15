import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  getRevenue(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('interval') interval: 'day' | 'month' | 'year',
  ) {
    // Default to this month if not provided
    const now = new Date();
    const start = from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = to || now.toISOString();
    const intv = interval || 'day';

    return this.reportsService.getRevenue(start, end, intv);
  }
}
