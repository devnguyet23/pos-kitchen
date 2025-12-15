import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @IsInt()
  @IsOptional()
  tableId?: number;

  @IsInt()
  @IsOptional()
  orderId?: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
