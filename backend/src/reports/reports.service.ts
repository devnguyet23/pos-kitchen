import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

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

    // Aggregate data
    const data: Record<string, { date: string, revenue: number, orders: number }> = {};

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

      if (!data[key]) {
        data[key] = { date: key, revenue: 0, orders: 0 };
      }

      data[key].revenue += inv.total;
      data[key].orders += 1;
    }

    // Fill missing dates? For now, just return what we have.
    return Object.values(data);
  }
}
