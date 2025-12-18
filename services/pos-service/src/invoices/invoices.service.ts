import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { EventsGateway } from '../events/events.gateway';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BaseTenantService } from '../common/base-tenant.service';

@Injectable()
export class InvoicesService extends BaseTenantService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {
    super();
  }

  async create(createInvoiceDto: CreateInvoiceDto, user?: CurrentUserData) {
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
        if (!existing) orders = [order];
      }
    } else if (tableId) {
      orders = await this.prisma.order.findMany({
        where: {
          tableId,
          invoice: { is: null },
        },
        include: { items: true },
      });
    } else {
      throw new BadRequestException(
        'Either tableId or orderId must be provided.',
      );
    }

    if (orders.length === 0) {
      throw new BadRequestException('No active orders to checkout.');
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
      data: {
        orderId: lastOrder.id,
        subtotal,
        serviceCharge,
        tax,
        total,
        paymentMethod: paymentMethod || 'CASH',
        ...(user?.storeId && { storeId: user.storeId }),
      },
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

  async findAll(from?: string, to?: string, user?: CurrentUserData) {
    const where: any = {};

    // Scope filter
    if (user?.storeId) {
      where.storeId = user.storeId;
    } else if (user?.chainId) {
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

  async findOne(id: number) {
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
}
