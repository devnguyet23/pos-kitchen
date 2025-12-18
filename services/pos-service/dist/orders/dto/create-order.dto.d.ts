export declare class CreateOrderItemDto {
    productId: number;
    quantity: number;
    notes?: string;
}
export declare class CreateOrderDto {
    tableId?: number;
    items: CreateOrderItemDto[];
}
