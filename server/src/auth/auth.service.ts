import { BadGatewayException, BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { generateOtp, hashOtp } from './utils/otp.util';
import { EmailService } from './email/email.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async register(registerDto: RegisterDto) {
        const {firstName, lastName, email, password} = registerDto;

        //Normalize Input
        const normalizedFirstName = firstName.trim();
        const normalizedLastName = lastName.trim();
        const normalizedEmail = email.trim().toLowerCase();


        //check if email already exists
        const existingUser = await this.prisma.user.findUnique({where: {
            email: normalizedEmail
        }});

        if(existingUser) {
            throw new ConflictException("Email is already registered")
        }

        //hash password
        const passwordHash = await bcrypt.hash(password, 12);

        //create user
        const user = await this.prisma.user.create({
            data: {
                firstName: normalizedFirstName,
                lastName: normalizedLastName,
                email: normalizedEmail,
                passwordHash,


                role: "USER",
                isEmailVerified: false,
                isActive: true
            }
        });

        //generate  otp

        const otp = generateOtp();

        //hash otp

        const tokenHash = hashOtp(otp);

        // Otp expiry
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        //store otp hash
        await this.prisma.verificationToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt
            }
        });

        // send email
        await this.emailService.sendVerificationEmail(user.email, user.firstName, otp);


        return {
            success: true,
            message: "Registeration successfull",
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        }
    }


    //verify otp
    async verifyEmail(email: string, otp: string) {

        //normalize email
        const normalizedEmail = email.trim().toLocaleLowerCase();

        //Find User
        const user = await this.prisma.user.findUnique({
            where: {
                email: normalizedEmail
            }
        });

        if(!user) {
            throw new NotFoundException("User not found");
        }

        //check if already verified
        if(user.isEmailVerified) {
            throw new ConflictException("Email is already verified")
        }

        //find latest unused verification token
        const verificationToken = await this.prisma.verificationToken.findFirst({
            where: {
                userId: user.id,
                used: false
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        if(!verificationToken) {
            throw new BadRequestException("Verification code not found or already used")
        }

        //Maximum attempts
        const MAX_ATTEMPTS = 5;
        if(verificationToken.attempts >= MAX_ATTEMPTS) {
            throw new BadGatewayException("Too many invalid attemps. Please request a new verification code.");
        }

        //check expiry
        if(verificationToken.expiresAt < new Date()) {
            throw new BadRequestException("Verification code has expired. Please request a new token")
        }


        //hash the otp provided by user
        const submittedOtpHash = hashOtp(otp);

        //compare hashes
        if(submittedOtpHash !== verificationToken.tokenHash) {
            //increase failed attempts
            await this.prisma.verificationToken.update({
                where: {
                    id: verificationToken.id
                },
                data: {
                    attempts: {
                        increment: 1
                    }
                }
            });
            throw new BadRequestException("Invalid verification code");

        }

        //mark otp as used
        await this.prisma.verificationToken.update({
            where: {
                id: verificationToken.id
            },
            data: {
                used: true
            }
        });

        // Mark email as verified
        const updatedUser = await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                isEmailVerified: true
            }
        });

        return {
            success: true,
            message: "Email verified successfully",
            data: {
                id: updatedUser.id,

                firstName:
                    updatedUser.firstName,

                lastName:
                    updatedUser.lastName,

                email:
                    updatedUser.email,

                role:
                    updatedUser.role,

                isEmailVerified:
                    updatedUser.isEmailVerified,

                isActive:
                    updatedUser.isActive,
            }
        }
    }

    // resend verification otp

    async resendVerificationEmail(email: string) {
    const normalizedEmail =
        email.trim().toLowerCase();

    // Find user
    const user =
        await this.prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

    if (!user) {
        throw new NotFoundException(
            'User not found',
        );
    }

    // Already verified
    if (user.isEmailVerified) {
        throw new ConflictException(
            'Email is already verified',
        );
    }

    const now = new Date();

    // Find latest OTP request
    const lastOtpRequest =
        await this.prisma.otpRequest.findFirst({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

    // 60-second cooldown
    if (lastOtpRequest) {
        const secondsSinceLastRequest =
            (now.getTime() -
                lastOtpRequest.createdAt.getTime()) /
            1000;

        if (secondsSinceLastRequest < 60) {
            const remainingSeconds =
                Math.ceil(
                    60 -
                    secondsSinceLastRequest,
                );

            throw new BadRequestException(
                `Please wait ${remainingSeconds} seconds before requesting another code`,
            );
        }
    }

    // Maximum 5 requests per hour
    const oneHourAgo = new Date(
        now.getTime() -
        60 * 60 * 1000,
    );

    const requestsLastHour =
        await this.prisma.otpRequest.count({
            where: {
                userId: user.id,
                createdAt: {
                    gte: oneHourAgo,
                },
            },
        });

    if (requestsLastHour >= 5) {
        throw new BadRequestException(
            'Too many verification code requests. Please try again later.',
        );
    }

    // Invalidate previous OTPs
    await this.prisma.verificationToken.updateMany({
        where: {
            userId: user.id,
            used: false,
        },
        data: {
            used: true,
        },
    });

    // Generate new OTP
    const otp = generateOtp();

    // Hash OTP
    const tokenHash = hashOtp(otp);

    // Expiry: 10 minutes
    const expiresAt = new Date(
        now.getTime() +
        10 * 60 * 1000,
    );

    // Save OTP
    await this.prisma.verificationToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });

    // Record request
    await this.prisma.otpRequest.create({
        data: {
            userId: user.id,
        },
    });

    // Send email
    await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        otp,
    );

    return {
        success: true,
        message:
            'A new verification code has been sent to your email',
    };
}



    //Login
    async login(loginDto: LoginDto) {
        const {email, password} = loginDto;

        //Normalize
        const normalizedEmail = email.trim().toLocaleLowerCase();

        //Find User
        const user = await this.prisma.user.findUnique({
            where: {
                email: normalizedEmail
            }
        });

        if(!user) {
            throw new UnauthorizedException("Invalid email or password");
        }

        //Check account status
        if(!user.isActive) {
            throw new UnauthorizedException("Your account has been deactivated")
        }

        //Check email verification
        if(!user.isEmailVerified) {
            throw new UnauthorizedException("Please verify your email before logging in");
        }

        //Compare password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if(!isPasswordValid) {
            throw new UnauthorizedException("Invalid email or password");
        }

        //Generate tokens
        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
            role: user.role
        }, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: "7m" ,
        });

        const refreshToken = await this.jwtService.signAsync({
            sub: user.id,
            jti: randomUUID(),

        }, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });

        //Hash refresh token before storing
        const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                refreshTokenHash
            }
        });

        return {
            success: true,
            message: "Login successful",
            data: {
                accessToken,
                refreshToken,

                user: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        isEmailVerified: user.isEmailVerified,
                        isActive: user.isActive,
                }
            }
        }

    }


    //Refresh token method
async refreshToken(refreshToken: string) {
    try {
        // 1. Verify refresh token
        const payload = await this.jwtService.verifyAsync<{ sub: string }>(
            refreshToken,
            {
                secret: this.configService.get<string>(
                    "JWT_REFRESH_SECRET",
                ),
            },
        );

        // 2. Find user
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            },
        });

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        // 3. Check account status
        if (!user.isActive) {
            throw new UnauthorizedException("Account is inactive");
        }

        // 4. Check stored refresh token
        if (!user.refreshTokenHash) {
            throw new UnauthorizedException(
                "Refresh token is invalid",
            );
        }

        // 5. Compare provided refresh token with DB hash
        const isRefreshTokenValid = await bcrypt.compare(
            refreshToken,
            user.refreshTokenHash,
        );

        if (!isRefreshTokenValid) {
            throw new UnauthorizedException(
                "Refresh token is invalid",
            );
        }

        // 6. Generate new access token
        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
            },
            {
                secret: this.configService.get<string>(
                    "JWT_ACCESS_SECRET",
                ),
                expiresIn: "15m",
            },
        );

        // 7. Generate new refresh token
        const newRefreshToken = await this.jwtService.signAsync(
            {
                sub: user.id,
            },
            {
                secret: this.configService.get<string>(
                    "JWT_REFRESH_SECRET",
                ),
                expiresIn: "7d",
            },
        );

        // 8. Hash new refresh token
        const newRefreshTokenHash = await bcrypt.hash(
            newRefreshToken,
            12,
        );

        // 9. Replace old refresh token
        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                refreshTokenHash: newRefreshTokenHash,
            },
        });

        return {
            success: true,
            message: "Tokens refreshed successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        };
    } catch (error) {
        throw new UnauthorizedException(
            "Invalid or expired refresh token",
        );
    }
}


    // logout
    async logout(refreshToken: string) {
    try {
        const payload = await this.jwtService.verifyAsync<{ sub: string }>(
            refreshToken,
            {
                secret: this.configService.get<string>(
                    "JWT_REFRESH_SECRET",
                ),
            },
        );

        await this.prisma.user.update({
            where: {
                id: payload.sub,
            },
            data: {
                refreshTokenHash: null,
            },
        });

        return {
            success: true,
            message: "Logout successful",
        };
    } catch (error) {
        throw new UnauthorizedException(
            "Invalid or expired refresh token",
        );
    }
}
}
