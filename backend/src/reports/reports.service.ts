import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  async getRevenue(from: string, to: string, interval: 'day' | 'month' | 'year') {
    const startDate = new Date(from);
    const endDate = new Date(to);

    // Fetch invoices with order items to calculate revenue from items
    const invoices = await this.prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate data from invoices - calculate revenue from order items
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

      // Calculate revenue from order items (price × quantity)
      const orderRevenue = inv.order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      dataMap[key].revenue += orderRevenue;
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

  async getRevenueByProduct(from: string, to: string, interval: 'day' | 'month' | 'year') {
    const startDate = new Date(from);
    const endDate = new Date(to);

    // Fetch invoices with order items and products
    const invoices = await this.prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get all products for consistent ordering
    const allProducts = await this.prisma.product.findMany({
      orderBy: { id: 'asc' },
    });

    // Aggregate data by date and product - track both revenue and quantity
    const revenueMap: Record<string, Record<number, number>> = {};
    const quantityMap: Record<string, Record<number, number>> = {};

    for (const inv of invoices) {
      const date = new Date(inv.createdAt);
      let key = '';

      if (interval === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (interval === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (interval === 'year') {
        key = `${date.getFullYear()}`;
      }

      if (!revenueMap[key]) {
        revenueMap[key] = {};
        quantityMap[key] = {};
      }

      for (const item of inv.order.items) {
        const productId = item.productId;
        const revenue = item.quantity * item.product.price;
        revenueMap[key][productId] = (revenueMap[key][productId] || 0) + revenue;
        quantityMap[key][productId] = (quantityMap[key][productId] || 0) + item.quantity;
      }
    }

    // Build result with all dates filled in
    const result: { date: string, products: { productId: number, productName: string, revenue: number, quantity: number }[] }[] = [];
    const dateKeys = this.generateDateKeys(startDate, endDate, interval);

    for (const key of dateKeys) {
      const products = allProducts.map(p => ({
        productId: p.id,
        productName: p.name,
        revenue: revenueMap[key]?.[p.id] || 0,
        quantity: quantityMap[key]?.[p.id] || 0,
      })).filter(p => p.revenue > 0 || p.quantity > 0 || dateKeys.some(dk => revenueMap[dk]?.[p.productId] > 0));

      result.push({ date: key, products });
    }

    // Get unique products that have any data
    const activeProductIds = new Set<number>();
    for (const key of dateKeys) {
      if (revenueMap[key]) {
        Object.keys(revenueMap[key]).forEach(id => activeProductIds.add(Number(id)));
      }
    }

    const legend = allProducts
      .filter(p => activeProductIds.has(p.id))
      .map(p => ({ productId: p.id, productName: p.name }));

    return { data: result, legend };
  }

  async getRevenueByCategory(from: string, to: string, interval: 'day' | 'month' | 'year') {
    const startDate = new Date(from);
    const endDate = new Date(to);

    // Fetch invoices with order items, products, and categories
    const invoices = await this.prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get all categories
    const allCategories = await this.prisma.category.findMany({
      orderBy: { id: 'asc' },
    });

    // Aggregate data by date and category - track both revenue and quantity
    const revenueMap: Record<string, Record<number, number>> = {};
    const quantityMap: Record<string, Record<number, number>> = {};

    for (const inv of invoices) {
      const date = new Date(inv.createdAt);
      let key = '';

      if (interval === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (interval === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (interval === 'year') {
        key = `${date.getFullYear()}`;
      }

      if (!revenueMap[key]) {
        revenueMap[key] = {};
        quantityMap[key] = {};
      }

      for (const item of inv.order.items) {
        const categoryId = item.product.categoryId;
        const revenue = item.quantity * item.product.price;
        revenueMap[key][categoryId] = (revenueMap[key][categoryId] || 0) + revenue;
        quantityMap[key][categoryId] = (quantityMap[key][categoryId] || 0) + item.quantity;
      }
    }

    // Build result with all dates filled in
    const result: { date: string, categories: { categoryId: number, categoryName: string, revenue: number, quantity: number }[] }[] = [];
    const dateKeys = this.generateDateKeys(startDate, endDate, interval);

    for (const key of dateKeys) {
      const categories = allCategories.map(c => ({
        categoryId: c.id,
        categoryName: c.name,
        revenue: revenueMap[key]?.[c.id] || 0,
        quantity: quantityMap[key]?.[c.id] || 0,
      }));

      result.push({ date: key, categories });
    }

    // Get unique categories that have any data
    const activeCategoryIds = new Set<number>();
    for (const key of dateKeys) {
      if (revenueMap[key]) {
        Object.keys(revenueMap[key]).forEach(id => activeCategoryIds.add(Number(id)));
      }
    }

    const legend = allCategories
      .filter(c => activeCategoryIds.has(c.id))
      .map(c => ({ categoryId: c.id, categoryName: c.name }));

    return { data: result, legend };
  }

  private generateDateKeys(startDate: Date, endDate: Date, interval: 'day' | 'month' | 'year'): string[] {
    const keys: string[] = [];

    if (interval === 'day') {
      const current = new Date(startDate);
      while (current <= endDate) {
        keys.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    } else if (interval === 'month') {
      let year = startDate.getFullYear();
      let month = startDate.getMonth();
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();

      while (year < endYear || (year === endYear && month <= endMonth)) {
        keys.push(`${year}-${String(month + 1).padStart(2, '0')}`);
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }
    } else if (interval === 'year') {
      for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
        keys.push(`${year}`);
      }
    }

    return keys;
  }
}

