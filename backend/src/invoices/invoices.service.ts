import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    const { tableId, paymentMethod } = createInvoiceDto;
    
    const orders = await this.prisma.order.findMany({
      where: {
        tableId,
        invoice: { is: null } // Not yet invoiced
      },
      include: { items: true }
    });

    if (orders.length === 0) {
      throw new BadRequestException('No active orders to checkout for this table.');
    }

    let subtotal = 0;
    for (const order of orders) {
      subtotal += order.total;
    }

    const serviceChargeRate = 0.05; // 5%
    const taxRate = 0.10; // 10%

    const serviceCharge = subtotal * serviceChargeRate;
    const tax = (subtotal + serviceCharge) * taxRate;
    const total = subtotal + serviceCharge + tax;

    // Link to the last order for simplicity in 1-1 schema
    const lastOrder = orders[orders.length - 1];

    const invoice = await this.prisma.invoice.create({
      data: {
        orderId: lastOrder.id,
        subtotal,
        serviceCharge,
        tax,
        total,
        paymentMethod: paymentMethod || 'CASH',
      }
    });

    // Update Table Status
    await this.prisma.table.update({
      where: { id: tableId },
      data: { status: 'AVAILABLE' }
    });
    this.eventsGateway.sendTableUpdate(tableId, 'AVAILABLE');

    // Update Orders Status
    await this.prisma.order.updateMany({
        where: {
            id: { in: orders.map(o => o.id) }
        },
        data: { status: 'COMPLETED' }
    });

    return invoice;
  }

  findAll() {
    return this.prisma.invoice.findMany();
  }
}
