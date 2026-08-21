import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';






@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }


  //update
  async updateMe(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
    });

    if(!user) {
      throw new NotFoundException("User not found")
    }

    const updateUser = await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        ...(updateProfileDto.firstName !== undefined && {
          firstName: updateProfileDto.firstName.trim(),
        }),

        ...(updateProfileDto.lastName !== undefined && {
          lastName: updateProfileDto.lastName.trim()
        })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updateUser
  }


  //Chnage Password
  async changePassword(userId: string, chnagePasswordDto: ChangePasswordDto) {
    const {currentPassword, newPassword} = chnagePasswordDto;
    //Find User
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
    });

    if(!user) {
      throw new NotFoundException("User not found")
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if(!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current Password is Incorrect");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if(isSamePassword) {
      throw new UnauthorizedException("New Pasword must be different from the current password");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        passwordHash: newPasswordHash,
        refreshTokenHash: null
      }
    });

    return {
      message: "Password changed successfully"
    }

  }
}