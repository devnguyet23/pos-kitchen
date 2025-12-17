import { ReportsService } from './reports.service';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getRevenue(from: string, to: string, interval: 'day' | 'month' | 'year', user: CurrentUserData): Promise<{
        date: string;
        revenue: number;
        orders: number;
    }[]>;
    getRevenueByProduct(from: string, to: string, interval: 'day' | 'month' | 'year', user: CurrentUserData): Promise<{
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
    getRevenueByCategory(from: string, to: string, interval: 'day' | 'month' | 'year', user: CurrentUserData): Promise<{
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
}
