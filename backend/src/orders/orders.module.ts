import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { EventsModule } from '../events/events.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [EventsModule, InventoryModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
