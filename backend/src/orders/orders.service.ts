import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class OrdersService {
                    constructor(
                                        private prisma: PrismaService,
                                        private eventsGateway: EventsGateway,
                    ) { }

                    async create(createOrderDto: CreateOrderDto) {
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

                    findAll() {
                                        return this.prisma.order.findMany({
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
