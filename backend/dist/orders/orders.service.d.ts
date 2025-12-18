import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventsGateway } from '../events/events.gateway';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BaseTenantService } from '../common/base-tenant.service';
export declare class OrdersService extends BaseTenantService {
    private prisma;
    private eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(createOrderDto: CreateOrderDto, user?: CurrentUserData): Promise<{
        items: ({
            product: {
                status: number;
                id: number;
                chainId: number | null;
                createdAt: Date;
                name: string;
                price: number;
                image: string | null;
                categoryId: number;
            };
        } & {
            status: string;
            orderId: number;
            id: number;
            chainId: number | null;
            storeId: number | null;
            productId: number;
            quantity: number;
            notes: string | null;
        })[];
    } & {
        status: string;
        tableId: number | null;
        id: number;
        chainId: number | null;
        storeId: number | null;
        total: number;
        userId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(user?: CurrentUserData): import(".prisma/client").Prisma.PrismaPromise<({
        table: {
            status: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            x: number;
            y: number;
            seats: number;
        };
        items: ({
            product: {
                status: number;
                id: number;
                chainId: number | null;
                createdAt: Date;
                name: string;
                price: number;
                image: string | null;
                categoryId: number;
            };
        } & {
            status: string;
            orderId: number;
            id: number;
            chainId: number | null;
            storeId: number | null;
            productId: number;
            quantity: number;
            notes: string | null;
        })[];
    } & {
        status: string;
        tableId: number | null;
        id: number;
        chainId: number | null;
        storeId: number | null;
        total: number;
        userId: number | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
