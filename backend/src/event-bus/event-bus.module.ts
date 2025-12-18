import { Module, Global } from '@nestjs/common';
import { EventBusService } from './event-bus.service';

/**
 * EventBusModule - Message queue integration
 * Global module for publishing and consuming events
 */
@Global()
@Module({
                    providers: [EventBusService],
                    exports: [EventBusService],
})
export class EventBusModule { }
