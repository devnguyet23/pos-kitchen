import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards';
import { Public, CurrentUser, CurrentUserData } from './decorators';

@Controller('auth')
export class AuthController {
                    constructor(private readonly authService: AuthService) { }

                    @Public()
                    @Post('login')
                    @HttpCode(HttpStatus.OK)
                    async login(@Body() loginDto: LoginDto) {
                                        return this.authService.login(loginDto);
                    }

                    @Public()
                    @Post('register')
                    async register(@Body() registerDto: RegisterDto) {
                                        return this.authService.register(registerDto);
                    }

                    @Public()
                    @Post('refresh')
                    @HttpCode(HttpStatus.OK)
                    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
                                        return this.authService.refreshToken(refreshTokenDto.refreshToken);
                    }

                    @UseGuards(JwtAuthGuard)
                    @Post('change-password')
                    @HttpCode(HttpStatus.OK)
                    async changePassword(
                                        @CurrentUser() user: CurrentUserData,
                                        @Body() changePasswordDto: ChangePasswordDto,
                    ) {
                                        return this.authService.changePassword(user.id, changePasswordDto);
                    }

                    @UseGuards(JwtAuthGuard)
                    @Get('profile')
                    async getProfile(@CurrentUser() user: CurrentUserData) {
                                        return this.authService.getProfile(user.id);
                    }

                    @UseGuards(JwtAuthGuard)
                    @Get('me')
                    async me(@CurrentUser() user: CurrentUserData) {
                                        return user;
                    }
}
