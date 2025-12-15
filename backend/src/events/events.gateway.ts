import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  sendTableUpdate(tableId: number, status: string) {
    this.server.emit('table_update', { tableId, status });
  }

  sendOrderCreated(order: any) {
    this.server.emit('order_created', order);
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: string): string {
    return 'pong';
  }
}
