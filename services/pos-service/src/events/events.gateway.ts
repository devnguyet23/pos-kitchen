import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
                    @WebSocketServer()
                    server: Server;

                    @SubscribeMessage('ping')
                    handlePing(@MessageBody() data: string): string {
                                        return 'pong';
                    }

                    sendTableUpdate(tableId: number, status: string) {
                                        this.server.emit('table:updated', { tableId, status });
                    }

                    sendOrderUpdate(order: any) {
                                        this.server.emit('order:new', order);
                    }

                    sendOrderItemUpdate(orderItem: any) {
                                        this.server.emit('orderItem:updated', orderItem);
                    }
}
