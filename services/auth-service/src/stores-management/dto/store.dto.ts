import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsNumber, IsDecimal } from 'class-validator';

export enum StoreStatus {
                    ACTIVE = 'ACTIVE',
                    INACTIVE = 'INACTIVE',
                    MAINTENANCE = 'MAINTENANCE',
}

export class CreateStoreDto {
                    @IsNumber()
                    @IsNotEmpty({ message: 'Chain ID không được để trống' })
                    chainId: number;

                    @IsString()
                    @IsNotEmpty({ message: 'Tên cửa hàng không được để trống' })
                    name: string;

                    @IsString()
                    @IsNotEmpty({ message: 'Mã cửa hàng không được để trống' })
                    code: string;

                    @IsString()
                    @IsOptional()
                    address?: string;

                    @IsString()
                    @IsOptional()
                    ward?: string;

                    @IsString()
                    @IsOptional()
                    district?: string;

                    @IsString()
                    @IsOptional()
                    city?: string;

                    @IsString()
                    @IsOptional()
                    phone?: string;

                    @IsEmail({}, { message: 'Email không hợp lệ' })
                    @IsOptional()
                    email?: string;

                    @IsOptional()
                    latitude?: number;

                    @IsOptional()
                    longitude?: number;

                    @IsString()
                    @IsOptional()
                    openingTime?: string;

                    @IsString()
                    @IsOptional()
                    closingTime?: string;

                    @IsEnum(StoreStatus)
                    @IsOptional()
                    status?: StoreStatus;
}

export class UpdateStoreDto {
                    @IsString()
                    @IsOptional()
                    name?: string;

                    @IsString()
                    @IsOptional()
                    address?: string;

                    @IsString()
                    @IsOptional()
                    ward?: string;

                    @IsString()
                    @IsOptional()
                    district?: string;

                    @IsString()
                    @IsOptional()
                    city?: string;

                    @IsString()
                    @IsOptional()
                    phone?: string;

                    @IsEmail({}, { message: 'Email không hợp lệ' })
                    @IsOptional()
                    email?: string;

                    @IsOptional()
                    latitude?: number;

                    @IsOptional()
                    longitude?: number;

                    @IsString()
                    @IsOptional()
                    openingTime?: string;

                    @IsString()
                    @IsOptional()
                    closingTime?: string;

                    @IsEnum(StoreStatus)
                    @IsOptional()
                    status?: StoreStatus;
}
