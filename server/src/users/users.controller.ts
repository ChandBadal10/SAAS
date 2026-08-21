import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}

    @Get("me")
    @UseGuards(JwtAuthGuard)
    async getMe(
        @Req() req: any
    ) {
        const user = await this.usersService.getMe(req.user.userId);

        return {
            success: true,
            message: "Profile fetched successfully",
            data: user
        }
    }
}
