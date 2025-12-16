import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  async getRevenue(from: string, to: string, interval: 'day' | 'month' | 'year') {
    const startDate = new Date(from);
    const endDate = new Date(to);

    // Fetch invoices in range
    const invoices = await this.prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate data from invoices
    const dataMap: Record<string, { date: string, revenue: number, orders: number }> = {};

    for (const inv of invoices) {
      const date = new Date(inv.createdAt);
      let key = '';

      if (interval === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (interval === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      } else if (interval === 'year') {
        key = `${date.getFullYear()}`; // YYYY
      }

      if (!dataMap[key]) {
        dataMap[key] = { date: key, revenue: 0, orders: 0 };
      }

      dataMap[key].revenue += inv.total;
      dataMap[key].orders += 1;
    }

    // Fill in all dates/months/years in range with 0 if missing
    const result: { date: string, revenue: number, orders: number }[] = [];

    if (interval === 'day') {
      const current = new Date(startDate);
      while (current <= endDate) {
        const key = current.toISOString().split('T')[0];
        result.push(dataMap[key] || { date: key, revenue: 0, orders: 0 });
        current.setDate(current.getDate() + 1);
      }
    } else if (interval === 'month') {
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();

      let year = startYear;
      let month = startMonth;

      while (year < endYear || (year === endYear && month <= endMonth)) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        result.push(dataMap[key] || { date: key, revenue: 0, orders: 0 });
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }
    } else if (interval === 'year') {
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      for (let year = startYear; year <= endYear; year++) {
        const key = `${year}`;
        result.push(dataMap[key] || { date: key, revenue: 0, orders: 0 });
      }
    }

    return result;
  }
}
