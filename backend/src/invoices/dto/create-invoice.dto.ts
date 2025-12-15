import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @IsInt()
  tableId: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
