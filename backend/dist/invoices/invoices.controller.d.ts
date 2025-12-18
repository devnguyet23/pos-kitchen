import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    create(createInvoiceDto: CreateInvoiceDto, user: CurrentUserData): Promise<{
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
