import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BaseTenantService } from '../common/base-tenant.service';
export declare class ReportsService extends BaseTenantService {
    private prisma;
    constructor(prisma: PrismaService);
    getRevenue(from: string, to: string, interval: 'day' | 'month' | 'year', user?: CurrentUserData): Promise<{
        date: string;
        revenue: number;
        orders: number;
    }[]>;
    getRevenueByProduct(from: string, to: string, interval: 'day' | 'month' | 'year', user?: CurrentUserData): Promise<{
        data: {
            date: string;
            products: {
                productId: number;
                productName: string;
                revenue: number;
                quantity: number;
            }[];
        }[];
        legend: {
            productId: number;
            productName: string;
        }[];
    }>;
    getRevenueByCategory(from: string, to: string, interval: 'day' | 'month' | 'year', user?: CurrentUserData): Promise<{
        data: {
            date: string;
            categories: {
                categoryId: number;
                categoryName: string;
                revenue: number;
                quantity: number;
            }[];
        }[];
        legend: {
            categoryId: number;
            categoryName: string;
        }[];
    }>;
    private generateDateKeys;
}
