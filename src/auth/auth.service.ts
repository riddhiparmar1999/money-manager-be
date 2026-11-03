import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  createRefreshTokenValue,
  hashRefreshToken,
  refreshTokenExpiresAt,
} from './auth.tokens.js';
import type { AuthenticatedUser } from './auth.types.js';
import { LoginDto } from './dto/login.dto.js';
import { LogoutDto } from './dto/logout.dto.js';
import { RegisterDto } from './dto/register.dto.js';

const BCRYPT_ROUNDS = 10;

export type RegisterResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    message: string;
  };
};

export type MessageResponse = {
  message: string;
};

export type ProfileResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type AccessTokenPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      return {
        message: 'Account created successfully. You can sign in now.',
        user,
      };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          message: 'Email is already registered',
          error: 'Conflict',
        });
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.createAccessToken(user.id, user.email);
    const refreshToken = await this.createAndStoreRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        message: 'Logged in successfully',
      },
    };
  }

  async getProfile(authUser: AuthenticatedUser): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: authUser.sub },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        error: 'Not Found',
      });
    }

    return {
      message: 'Profile fetched successfully',
      user,
    };
  }

  async logout(
    authUser: AuthenticatedUser,
    dto: LogoutDto,
  ): Promise<MessageResponse> {
    if (dto.refreshToken) {
      const tokenHash = hashRefreshToken(dto.refreshToken);
      await this.prisma.refreshToken.deleteMany({
        where: { userId: authUser.sub, tokenHash },
      });
    } else {
      await this.prisma.refreshToken.deleteMany({
        where: { userId: authUser.sub },
      });
    }

    return { message: 'Logged out successfully' };
  }

  private async createAccessToken(userId: string, email: string): Promise<string> {
    const payload: AccessTokenPayload = { sub: userId, email };
    return this.jwtService.signAsync(payload);
  }

  private async createAndStoreRefreshToken(userId: string): Promise<string> {
    const refreshToken = createRefreshTokenValue();
    const tokenHash = hashRefreshToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: refreshTokenExpiresAt(),
      },
    });

    return refreshToken;
  }
}
