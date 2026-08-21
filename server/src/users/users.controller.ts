import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/generated/prisma/enums';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';


import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}

    //get me
    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: "Get current user profile",
        description: "Returns the profile of the currently authenticated user."
    })
    @ApiBearerAuth('access-token')
    @ApiResponse({
    status: 200,
    description: 'Profile fetched successfully.',
    })
    @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing access token.',
    })
    @ApiResponse({
    status: 404,
    description: 'User not found.',
    })
    async getMe(
        @Req() req: any
    ) {
        return this.usersService.getMe(req.user.userId);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({
    summary: 'Get all users',
    description: 'Returns all users. This endpoint is accessible only by ADMIN.',
    })
    @ApiBearerAuth('access-token')
    @ApiResponse({
    status: 200,
    description: 'Users fetched successfully.',
    })
    @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing access token.',
    })
    @ApiResponse({
    status: 403,
    description: 'Forbidden. Only ADMIN can access this endpoint.',
    })
    async getAllUsers() {
    return this.usersService.getAllUsers();
    }

    //update profile
    @Patch("me")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates the first name and last name of the authenticated user.',
    })
    @ApiBearerAuth('access-token')
    @ApiResponse({
    status: 200,
    description: 'Profile updated successfully.',
    })
    @ApiResponse({
    status: 400,
    description: 'Invalid profile data.',
    })
    @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing access token.',
    })
    @ApiResponse({
    status: 404,
    description: 'User not found.',
    })



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
    @ApiOperation({
    summary: 'Change password',
    description: 'Changes the password of the currently authenticated user.',
    })
    @ApiBearerAuth('access-token')
    @ApiResponse({
    status: 200,
    description: 'Password changed successfully.',
    })
    @ApiResponse({
    status: 401,
    description: 'Current password is incorrect or user is unauthorized.',
    })
    @ApiResponse({
    status: 404,
    description: 'User not found.',
    })
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
    @ApiOperation({
    summary: 'Get user by ID',
    description: 'Returns a specific user. This endpoint is accessible only by ADMIN.',
    })
    @ApiBearerAuth('access-token')
    @ApiResponse({
    status: 200,
    description: 'User fetched successfully.',
    })
    @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing access token.',
    })
    @ApiResponse({
    status: 403,
    description: 'Forbidden. Only ADMIN can access this endpoint.',
    })
    @ApiResponse({
    status: 404,
    description: 'User not found.',
    })
    async getUserById(
        @Param("id") id: string
    ) {
        return this.usersService.getUserById(id);
    }


    //Update user status
    @Patch(":id/status")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({
    summary: 'Activate or deactivate a user',
    description:
    'Changes the active status of a user. Only ADMIN can activate or deactivate accounts.',
    })
    @ApiBearerAuth('access-token')
    @ApiResponse({
    status: 200,
    description: 'User status updated successfully.',
    })
    @ApiResponse({
    status: 400,
    description: 'Invalid status value.',
    })
    @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing access token.',
    })
    @ApiResponse({
    status: 403,
    description: 'Forbidden. Only ADMIN can change user status.',
    })
    @ApiResponse({
    status: 404,
    description: 'User not found.',
    })
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
