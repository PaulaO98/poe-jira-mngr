import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('me')
  me(
    @Req()
    req: Request & { user?: { id: number; email: string; name: string } },
  ) {
    return req.user;
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.name, dto.password);
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    // Try to read refresh token from cookie header: `refresh_token`.
    const cookieHeader = req.headers?.cookie as string | undefined;
    if (!cookieHeader) {
      throw new BadRequestException('Missing cookies');
    }

    // simple parser for cookie header
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const found = cookies.find((c) => c.startsWith('refresh_token='));
    if (!found) {
      throw new BadRequestException('Missing refresh_token cookie');
    }
    const refreshToken = found.split('=')[1];
    return this.auth.refresh(refreshToken);
  }
}
