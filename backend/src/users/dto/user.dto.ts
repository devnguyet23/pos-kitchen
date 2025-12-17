import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsNumber, IsBoolean, IsArray, MinLength } from 'class-validator';

export enum UserStatus {
                    ACTIVE = 'ACTIVE',
                    INACTIVE = 'INACTIVE',
                    SUSPENDED = 'SUSPENDED',
}

export class CreateUserDto {
                    @IsString()
                    @IsNotEmpty({ message: 'Username không được để trống' })
                    @MinLength(3, { message: 'Username phải có ít nhất 3 ký tự' })
                    username: string;

                    @IsEmail({}, { message: 'Email không hợp lệ' })
                    @IsNotEmpty({ message: 'Email không được để trống' })
                    email: string;

                    @IsString()
                    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
                    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
                    password: string;

                    @IsString()
                    @IsNotEmpty({ message: 'Họ tên không được để trống' })
                    fullName: string;

                    @IsString()
                    @IsOptional()
                    phone?: string;

                    @IsNumber()
                    @IsOptional()
                    chainId?: number;

                    @IsNumber()
                    @IsOptional()
                    storeId?: number;

                    @IsNumber()
                    @IsOptional()
                    roleId?: number;

                    @IsString()
                    @IsOptional()
                    avatarUrl?: string;

                    @IsString()
                    @IsOptional()
                    address?: string;

                    @IsString()
                    @IsOptional()
                    citizenId?: string;

                    @IsEnum(UserStatus)
                    @IsOptional()
                    status?: UserStatus;
}

export class UpdateUserDto {
                    @IsString()
                    @IsOptional()
                    username?: string;

                    @IsEmail({}, { message: 'Email không hợp lệ' })
                    @IsOptional()
                    email?: string;

                    @IsString()
                    @IsOptional()
                    fullName?: string;

                    @IsString()
                    @IsOptional()
                    phone?: string;

                    @IsNumber()
                    @IsOptional()
                    roleId?: number;

                    @IsNumber()
                    @IsOptional()
                    chainId?: number;

                    @IsNumber()
                    @IsOptional()
                    storeId?: number;

                    @IsString()
                    @IsOptional()
                    avatarUrl?: string;

                    @IsString()
                    @IsOptional()
                    address?: string;

                    @IsString()
                    @IsOptional()
                    citizenId?: string;

                    @IsEnum(UserStatus)
                    @IsOptional()
                    status?: UserStatus;
}

export class AssignRoleDto {
                    @IsNumber()
                    @IsNotEmpty({ message: 'Role ID không được để trống' })
                    roleId: number;

                    @IsNumber()
                    @IsOptional()
                    chainId?: number;

                    @IsNumber()
                    @IsOptional()
                    storeId?: number;
}

export class ResetPasswordDto {
                    @IsString()
                    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
                    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
                    newPassword: string;
}
