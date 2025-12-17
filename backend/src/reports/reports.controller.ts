import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('revenue')
  @RequirePermissions('view_revenue_reports')
  getRevenue(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('interval') interval: 'day' | 'month' | 'year',
    @CurrentUser() user: CurrentUserData,
  ) {
    // Default to this month if not provided
    const now = new Date();
    const start = from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = to || now.toISOString();
    const intv = interval || 'day';

    return this.reportsService.getRevenue(start, end, intv, user);
  }

  @Get('revenue-by-product')
  @RequirePermissions('view_revenue_reports')
  getRevenueByProduct(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('interval') interval: 'day' | 'month' | 'year',
    @CurrentUser() user: CurrentUserData,
  ) {
    const now = new Date();
    const start = from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = to || now.toISOString();
    const intv = interval || 'day';

    return this.reportsService.getRevenueByProduct(start, end, intv, user);
  }

  @Get('revenue-by-category')
  @RequirePermissions('view_revenue_reports')
  getRevenueByCategory(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('interval') interval: 'day' | 'month' | 'year',
    @CurrentUser() user: CurrentUserData,
  ) {
    const now = new Date();
    const start = from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = to || now.toISOString();
    const intv = interval || 'day';

    return this.reportsService.getRevenueByCategory(start, end, intv, user);
  }
}
