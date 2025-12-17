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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
const base_tenant_service_1 = require("../common/base-tenant.service");
let InvoicesService = class InvoicesService extends base_tenant_service_1.BaseTenantService {
    constructor(prisma, eventsGateway) {
        super();
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async create(createInvoiceDto, user) {
        const { tableId, orderId, paymentMethod } = createInvoiceDto;
        let orders = [];
        if (orderId) {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });
            if (order) {
                const existing = await this.prisma.invoice.findUnique({
                    where: { orderId },
                });
                if (!existing)
                    orders = [order];
            }
        }
        else if (tableId) {
            orders = await this.prisma.order.findMany({
                where: {
                    tableId,
                    invoice: { is: null },
                },
                include: { items: true },
            });
        }
        else {
            throw new common_1.BadRequestException('Either tableId or orderId must be provided.');
        }
        if (orders.length === 0) {
            throw new common_1.BadRequestException('No active orders to checkout.');
        }
        let subtotal = 0;
        for (const order of orders) {
            subtotal += order.total;
        }
        const serviceChargeRate = 0.05;
        const taxRate = 0.1;
        const serviceCharge = subtotal * serviceChargeRate;
        const tax = (subtotal + serviceCharge) * taxRate;
        const total = subtotal + serviceCharge + tax;
        const lastOrder = orders[orders.length - 1];
        const invoice = await this.prisma.invoice.create({
            data: Object.assign({ orderId: lastOrder.id, subtotal,
                serviceCharge,
                tax,
                total, paymentMethod: paymentMethod || 'CASH' }, ((user === null || user === void 0 ? void 0 : user.storeId) && { storeId: user.storeId })),
        });
        if (tableId) {
            await this.prisma.table.update({
                where: { id: tableId },
                data: { status: 'AVAILABLE' },
            });
            this.eventsGateway.sendTableUpdate(tableId, 'AVAILABLE');
        }
        await this.prisma.order.updateMany({
            where: {
                id: { in: orders.map((o) => o.id) },
            },
            data: { status: 'COMPLETED' },
        });
        return invoice;
    }
    async findAll(from, to, user) {
        const where = {};
        if (user === null || user === void 0 ? void 0 : user.storeId) {
            where.storeId = user.storeId;
        }
        else if (user === null || user === void 0 ? void 0 : user.chainId) {
            where.store = { chainId: user.chainId };
        }
        if (from || to) {
            where.createdAt = {};
            if (from) {
                where.createdAt.gte = new Date(from);
            }
            if (to) {
                where.createdAt.lte = new Date(to);
            }
        }
        return this.prisma.invoice.findMany({
            where,
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        table: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        return this.prisma.invoice.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        table: true,
                    },
                },
            },
        });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map