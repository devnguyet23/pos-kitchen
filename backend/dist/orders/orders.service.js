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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
const base_tenant_service_1 = require("../common/base-tenant.service");
let OrdersService = class OrdersService extends base_tenant_service_1.BaseTenantService {
    constructor(prisma, eventsGateway) {
        super();
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async create(createOrderDto, user) {
        const { tableId, items } = createOrderDto;
        let total = 0;
        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (product) {
                total += product.price * item.quantity;
            }
        }
        const order = await this.prisma.order.create({
            data: Object.assign(Object.assign(Object.assign({ tableId,
                total, status: 'PENDING' }, ((user === null || user === void 0 ? void 0 : user.storeId) && { storeId: user.storeId })), ((user === null || user === void 0 ? void 0 : user.id) && { userId: user.id })), { items: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        notes: item.notes,
                    })),
                } }),
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (tableId) {
            await this.prisma.table.update({
                where: { id: tableId },
                data: { status: 'OCCUPIED' },
            });
            this.eventsGateway.sendTableUpdate(tableId, 'OCCUPIED');
        }
        this.eventsGateway.sendOrderUpdate(order);
        return order;
    }
    findAll(user) {
        const where = {};
        if (user === null || user === void 0 ? void 0 : user.storeId) {
            where.storeId = user.storeId;
        }
        else if (user === null || user === void 0 ? void 0 : user.chainId) {
            where.store = { chainId: user.chainId };
        }
        return this.prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                table: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], OrdersService);
//# sourceMappingURL=orders.service.js.map