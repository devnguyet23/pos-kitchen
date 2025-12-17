"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const base_tenant_service_1 = require("../common/base-tenant.service");
let ReportsService = class ReportsService extends base_tenant_service_1.BaseTenantService {
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async getRevenue(from, to, interval, user) {
        const startDate = new Date(from);
        const endDate = new Date(to);
        const invoiceWhere = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (user === null || user === void 0 ? void 0 : user.storeId) {
            invoiceWhere.storeId = user.storeId;
        }
        else if (user === null || user === void 0 ? void 0 : user.chainId) {
            invoiceWhere.store = { chainId: user.chainId };
        }
        const invoices = await this.prisma.invoice.findMany({
            where: invoiceWhere,
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
        const dataMap = {};
        for (const inv of invoices) {
            const date = new Date(inv.createdAt);
            let key = '';
            if (interval === 'day') {
                key = date.toISOString().split('T')[0];
            }
            else if (interval === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            else if (interval === 'year') {
                key = `${date.getFullYear()}`;
            }
            if (!dataMap[key]) {
                dataMap[key] = { date: key, revenue: 0, orders: 0 };
            }
            const orderRevenue = inv.order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            dataMap[key].revenue += orderRevenue;
            dataMap[key].orders += 1;
        }
        const result = [];
        if (interval === 'day') {
            const current = new Date(startDate);
            while (current <= endDate) {
                const key = current.toISOString().split('T')[0];
                result.push(dataMap[key] || { date: key, revenue: 0, orders: 0 });
                current.setDate(current.getDate() + 1);
            }
        }
        else if (interval === 'month') {
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
        }
        else if (interval === 'year') {
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
                const key = `${year}`;
                result.push(dataMap[key] || { date: key, revenue: 0, orders: 0 });
            }
        }
        return result;
    }
    async getRevenueByProduct(from, to, interval, user) {
        const startDate = new Date(from);
        const endDate = new Date(to);
        const invoiceWhere = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (user === null || user === void 0 ? void 0 : user.storeId) {
            invoiceWhere.storeId = user.storeId;
        }
        else if (user === null || user === void 0 ? void 0 : user.chainId) {
            invoiceWhere.store = { chainId: user.chainId };
        }
        const invoices = await this.prisma.invoice.findMany({
            where: invoiceWhere,
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
        const allProducts = await this.prisma.product.findMany({
            orderBy: { id: 'asc' },
        });
        const revenueMap = {};
        const quantityMap = {};
        for (const inv of invoices) {
            const date = new Date(inv.createdAt);
            let key = '';
            if (interval === 'day') {
                key = date.toISOString().split('T')[0];
            }
            else if (interval === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            else if (interval === 'year') {
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
        const result = [];
        const dateKeys = this.generateDateKeys(startDate, endDate, interval);
        for (const key of dateKeys) {
            const products = allProducts.map(p => {
                var _a, _b;
                return ({
                    productId: p.id,
                    productName: p.name,
                    revenue: ((_a = revenueMap[key]) === null || _a === void 0 ? void 0 : _a[p.id]) || 0,
                    quantity: ((_b = quantityMap[key]) === null || _b === void 0 ? void 0 : _b[p.id]) || 0,
                });
            }).filter(p => p.revenue > 0 || p.quantity > 0 || dateKeys.some(dk => { var _a; return ((_a = revenueMap[dk]) === null || _a === void 0 ? void 0 : _a[p.productId]) > 0; }));
            result.push({ date: key, products });
        }
        const activeProductIds = new Set();
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
    async getRevenueByCategory(from, to, interval, user) {
        const startDate = new Date(from);
        const endDate = new Date(to);
        const invoiceWhere = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (user === null || user === void 0 ? void 0 : user.storeId) {
            invoiceWhere.storeId = user.storeId;
        }
        else if (user === null || user === void 0 ? void 0 : user.chainId) {
            invoiceWhere.store = { chainId: user.chainId };
        }
        const invoices = await this.prisma.invoice.findMany({
            where: invoiceWhere,
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
        const allCategories = await this.prisma.category.findMany({
            orderBy: { id: 'asc' },
        });
        const revenueMap = {};
        const quantityMap = {};
        for (const inv of invoices) {
            const date = new Date(inv.createdAt);
            let key = '';
            if (interval === 'day') {
                key = date.toISOString().split('T')[0];
            }
            else if (interval === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            else if (interval === 'year') {
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
        const result = [];
        const dateKeys = this.generateDateKeys(startDate, endDate, interval);
        for (const key of dateKeys) {
            const categories = allCategories.map(c => {
                var _a, _b;
                return ({
                    categoryId: c.id,
                    categoryName: c.name,
                    revenue: ((_a = revenueMap[key]) === null || _a === void 0 ? void 0 : _a[c.id]) || 0,
                    quantity: ((_b = quantityMap[key]) === null || _b === void 0 ? void 0 : _b[c.id]) || 0,
                });
            });
            result.push({ date: key, categories });
        }
        const activeCategoryIds = new Set();
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
    generateDateKeys(startDate, endDate, interval) {
        const keys = [];
        if (interval === 'day') {
            const current = new Date(startDate);
            while (current <= endDate) {
                keys.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        }
        else if (interval === 'month') {
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
        }
        else if (interval === 'year') {
            for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
                keys.push(`${year}`);
            }
        }
        return keys;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map