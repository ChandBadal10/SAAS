import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

    //update profile
    @Patch("me")
    @UseGuards(JwtAuthGuard)
    async updateMe(
        @Req() req: any,
        @Body() updateProfileDto: UpdateProfileDto
    ) {
        const user = await this.usersService.updateMe(req.user.userId, updateProfileDto);

        return {
            success: true,
            message: "Profile update successfully",
            data: user
        }
    }
}
