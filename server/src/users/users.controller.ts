import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/generated/prisma/enums';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

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
        return this.usersService.getMe(req.user.userId);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async getAllUsers() {
    return this.usersService.getAllUsers();
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


    //change Password
    @Patch('change-password')
    @UseGuards(JwtAuthGuard)
    async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
    ) {
    const result = await this.usersService.changePassword(
        req.user.userId,
        changePasswordDto,
    );

    return {
        success: true,
        message: result.message,
    };
    }

    //get user by id
    @Get(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async getUserById(
        @Param("id") id: string
    ) {
        return this.usersService.getUserById(id);
    }


    //Update user status
    @Patch(":id/status")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async updateUserStatus(
        @Param("id") id: string,
        @Body() updateUserStatusDto: UpdateUserStatusDto,
    ) {
        const user = await this.usersService.updateUserStatus(id, updateUserStatusDto.isActive);

        return {
            success: true,
            message: updateUserStatusDto.isActive ? "User account activated successfully" : "User account deactivated successfully", data: user
        }
    }
}
