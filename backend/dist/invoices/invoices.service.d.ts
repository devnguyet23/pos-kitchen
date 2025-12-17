import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { EventsGateway } from '../events/events.gateway';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BaseTenantService } from '../common/base-tenant.service';
export declare class InvoicesService extends BaseTenantService {
    private prisma;
    private eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(createInvoiceDto: CreateInvoiceDto, user?: CurrentUserData): Promise<{
        orderId: number;
        paymentMethod: string;
        id: number;
        chainId: number | null;
        storeId: number | null;
        total: number;
        createdAt: Date;
        subtotal: number;
        tax: number;
        serviceCharge: number;
    }>;
    findAll(from?: string, to?: string, user?: CurrentUserData): Promise<({
        order: {
            table: {
                id: number;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                x: number;
                y: number;
                seats: number;
            };
            items: ({
                product: {
                    id: number;
                    chainId: number | null;
                    status: number;
                    createdAt: Date;
                    name: string;
                    price: number;
                    image: string | null;
                    categoryId: number;
                };
            } & {
                orderId: number;
                id: number;
                chainId: number | null;
                storeId: number | null;
                status: string;
                productId: number;
                quantity: number;
                notes: string | null;
            })[];
        } & {
            tableId: number | null;
            id: number;
            chainId: number | null;
            storeId: number | null;
            status: string;
            total: number;
            userId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        orderId: number;
        paymentMethod: string;
        id: number;
        chainId: number | null;
        storeId: number | null;
        total: number;
        createdAt: Date;
        subtotal: number;
        tax: number;
        serviceCharge: number;
    })[]>;
    findOne(id: number): Promise<{
        order: {
            table: {
                id: number;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                x: number;
                y: number;
                seats: number;
            };
            items: ({
                product: {
                    id: number;
                    chainId: number | null;
                    status: number;
                    createdAt: Date;
                    name: string;
                    price: number;
                    image: string | null;
                    categoryId: number;
                };
            } & {
                orderId: number;
                id: number;
                chainId: number | null;
                storeId: number | null;
                status: string;
                productId: number;
                quantity: number;
                notes: string | null;
            })[];
        } & {
            tableId: number | null;
            id: number;
            chainId: number | null;
            storeId: number | null;
            status: string;
            total: number;
            userId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        orderId: number;
        paymentMethod: string;
        id: number;
        chainId: number | null;
        storeId: number | null;
        total: number;
        createdAt: Date;
        subtotal: number;
        tax: number;
        serviceCharge: number;
    }>;
}
