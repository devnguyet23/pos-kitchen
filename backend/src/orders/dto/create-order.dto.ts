import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
                    @IsInt()
                    productId: number;

                    @IsInt()
                    quantity: number;

                    @IsString()
                    @IsOptional()
                    notes?: string;
}

export class CreateOrderDto {
                    @IsInt()
                    @IsOptional()
                    tableId?: number;

                    @IsArray()
                    @ValidateNested({ each: true })
                    @Type(() => CreateOrderItemDto)
                    items: CreateOrderItemDto[];
}
