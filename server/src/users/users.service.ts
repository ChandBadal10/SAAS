import {
  BadRequestException,
  ConflictException,
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
  async updateMe(
  userId: string,
  updateProfileDto: UpdateProfileDto,
) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const normalizedEmail =
    updateProfileDto.email?.trim().toLowerCase();

  // Check if email is being changed
  if (
    normalizedEmail &&
    normalizedEmail !== user.email
  ) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (
      existingUser &&
      existingUser.id !== userId
    ) {
      throw new ConflictException(
        'Email is already registered',
      );
    }
  }

  const updatedUser =
    await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        ...(updateProfileDto.firstName !== undefined && {
          firstName:
            updateProfileDto.firstName.trim(),
        }),

        ...(updateProfileDto.lastName !== undefined && {
          lastName:
            updateProfileDto.lastName.trim(),
        }),

        ...(normalizedEmail &&
          normalizedEmail !== user.email && {
            email: normalizedEmail,

            // New email must be verified
            isEmailVerified: false,

            // Existing refresh token becomes invalid
            refreshTokenHash: null,
          }),
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

  return updatedUser;
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

  //get all users
  async getAllUsers() {
  const users = await this.prisma.user.findMany({
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
    orderBy: {
      createdAt: 'desc',
    },
    });

    return {
    message: 'Users fetched successfully',
    users,
    };
  }


  // get user by id
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
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

    if(!user) {
      throw new NotFoundException("User not found");
    }

    return {
      message: "User fetched successfully",
      user
    }
  }


  //update user status
  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
    });

    if(!user) {
      throw new NotFoundException("User not found")
    }

    //prevent admin from accidentally disabling themselvs
    if(user.role === "ADMIN") {
      throw new BadRequestException("Admin account status cannot be changed")
    }

    const updateUser = await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        isActive,
        ...(isActive == false && {
          refreshTokenHash: null
        }),
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
    return updateUser;
  }

}