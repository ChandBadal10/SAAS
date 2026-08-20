import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post("register")
    async register(
        @Body() registerDto: RegisterDto
    ) {
        return this.authService.register(registerDto)
    }


    @Post("verify-email")
    async verifyEmail(
        @Body() verifyEmailDto: VerifyEmailDto
    ) {
        return this.authService.verifyEmail(verifyEmailDto.email, verifyEmailDto.otp);
    }

    @Post("resend-verification")
    async resendVerification(
        @Body() resendVerificationDto: ResendVerificationDto
    ) {
        return this.authService.resendVerificationEmail(resendVerificationDto.email);
    }


    //Login
    @Post("login")
    async login(
        @Body() loginDto: LoginDto
    ) {
        return this.authService.login(loginDto)
    }

    //get me
    @Get("me")
    @UseGuards(JwtAuthGuard)
    getMe(
        @Req() req: any
    ) {
        return {
            success: true,
            message: "User Profile fetched successfully",
            data: req.user
        }
    }

    //refresh toke
    @Post("refresh")
    refreshToken(
        @Body() refreshTokenDto: RefreshTokenDto
    ) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken)
    }

    //Logout
    @Post('logout')
    async logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.refreshToken);
}
}
