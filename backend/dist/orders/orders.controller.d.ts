import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, user: CurrentUserData): Promise<{
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
    }>;
    findAll(user: CurrentUserData): import(".prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
}
