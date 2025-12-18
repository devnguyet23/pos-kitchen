import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';

export enum ChainStatus {
                    ACTIVE = 'ACTIVE',
                    INACTIVE = 'INACTIVE',
                    SUSPENDED = 'SUSPENDED',
}

export class CreateChainDto {
                    @IsString()
                    @IsNotEmpty({ message: 'Tên chuỗi không được để trống' })
                    name: string;

                    @IsString()
                    @IsNotEmpty({ message: 'Mã chuỗi không được để trống' })
                    code: string;

                    @IsString()
                    @IsOptional()
                    description?: string;

                    @IsString()
                    @IsOptional()
                    logoUrl?: string;

                    @IsEmail({}, { message: 'Email không hợp lệ' })
                    @IsOptional()
                    email?: string;

                    @IsString()
                    @IsOptional()
                    phone?: string;

                    @IsString()
                    @IsOptional()
                    address?: string;

                    @IsString()
                    @IsOptional()
                    website?: string;

                    @IsString()
                    @IsOptional()
                    taxCode?: string;

                    @IsEnum(ChainStatus)
                    @IsOptional()
                    status?: ChainStatus;
}

export class UpdateChainDto {
                    @IsString()
                    @IsOptional()
                    name?: string;

                    @IsString()
                    @IsOptional()
                    description?: string;

                    @IsString()
                    @IsOptional()
                    logoUrl?: string;

                    @IsEmail({}, { message: 'Email không hợp lệ' })
                    @IsOptional()
                    email?: string;

                    @IsString()
                    @IsOptional()
                    phone?: string;

                    @IsString()
                    @IsOptional()
                    address?: string;

                    @IsString()
                    @IsOptional()
                    website?: string;

                    @IsString()
                    @IsOptional()
                    taxCode?: string;

                    @IsEnum(ChainStatus)
                    @IsOptional()
                    status?: ChainStatus;
}
