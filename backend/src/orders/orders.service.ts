import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventsGateway } from '../events/events.gateway';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private inventoryService: InventoryService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { tableId, items } = createOrderDto;

    let total = 0;
    const orderItemsData = [];
    
    for (const item of items) {
       const product = await this.prisma.product.findUnique({ where: { id: item.productId }});
       if(product) {
         total += product.price * item.quantity;
         orderItemsData.push({
           productId: item.productId,
           quantity: item.quantity,
           notes: item.notes,
           status: 'PENDING',
         });
       }
    }

    const order = await this.prisma.order.create({
      data: {
        tableId,
        status: 'PENDING',
        total,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
            include: { product: true }
        },
        table: true,
      },
    });

    if (tableId) {
      await this.prisma.table.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' },
      });
      this.eventsGateway.sendTableUpdate(tableId, 'OCCUPIED');
    }

    // Deduct Inventory
    try {
      await this.inventoryService.deductForOrder(order.id);
    } catch(e) { console.error("Inventory error", e); }

    this.eventsGateway.sendOrderCreated(order);

    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { product: { include: { category: true } } } },
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
