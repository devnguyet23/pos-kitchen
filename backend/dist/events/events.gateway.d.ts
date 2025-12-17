import { Server } from 'socket.io';
export declare class EventsGateway {
    server: Server;
    handlePing(data: string): string;
    sendTableUpdate(tableId: number, status: string): void;
    sendOrderUpdate(order: any): void;
    sendOrderItemUpdate(orderItem: any): void;
}
