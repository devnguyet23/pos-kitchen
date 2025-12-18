import { IsString, IsNotEmpty, MinLength, IsEmail, IsOptional } from 'class-validator';

export class LoginDto {
                    @IsString()
                    @IsNotEmpty({ message: 'Username không được để trống' })
                    username: string;

                    @IsString()
                    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
                    password: string;
}

export class RegisterDto {
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
}

export class ChangePasswordDto {
                    @IsString()
                    @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
                    currentPassword: string;

                    @IsString()
                    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
                    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
                    newPassword: string;
}

export class RefreshTokenDto {
                    @IsString()
                    @IsNotEmpty({ message: 'Refresh token không được để trống' })
                    refreshToken: string;
}
