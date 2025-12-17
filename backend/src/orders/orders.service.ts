import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventsGateway } from '../events/events.gateway';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BaseTenantService } from '../common/base-tenant.service';

@Injectable()
export class OrdersService extends BaseTenantService {
                    constructor(
                                        private prisma: PrismaService,
                                        private eventsGateway: EventsGateway,
                    ) {
                                        super();
                    }

                    async create(createOrderDto: CreateOrderDto, user?: CurrentUserData) {
                                        const { tableId, items } = createOrderDto;

                                        // Calculate total
                                        let total = 0;
                                        for (const item of items) {
                                                            const product = await this.prisma.product.findUnique({
                                                                                where: { id: item.productId },
                                                            });
                                                            if (product) {
                                                                                total += product.price * item.quantity;
                                                            }
                                        }

                                        // Create order with items
                                        const order = await this.prisma.order.create({
                                                            data: {
                                                                                tableId,
                                                                                total,
                                                                                status: 'PENDING',
                                                                                ...(user?.storeId && { storeId: user.storeId }),
                                                                                ...(user?.id && { userId: user.id }),
                                                                                items: {
                                                                                                    create: items.map((item) => ({
                                                                                                                        productId: item.productId,
                                                                                                                        quantity: item.quantity,
                                                                                                                        notes: item.notes,
                                                                                                    })),
                                                                                },
                                                            },
                                                            include: {
                                                                                items: {
                                                                                                    include: {
                                                                                                                        product: true,
                                                                                                    },
                                                                                },
                                                            },
                                        });

                                        // Update table status if tableId provided
                                        if (tableId) {
                                                            await this.prisma.table.update({
                                                                                where: { id: tableId },
                                                                                data: { status: 'OCCUPIED' },
                                                            });
                                                            this.eventsGateway.sendTableUpdate(tableId, 'OCCUPIED');
                                        }

                                        // Emit real-time event
                                        this.eventsGateway.sendOrderUpdate(order);

                                        return order;
                    }

                    findAll(user?: CurrentUserData) {
                                        const where: any = {};

                                        // Scope filter: by store or by chain
                                        if (user?.storeId) {
                                                            where.storeId = user.storeId;
                                        } else if (user?.chainId) {
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
}
