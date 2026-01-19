import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdapterClientService } from '../adapter-client/adapter-client.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly adapter: AdapterClientService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.adapter.validateUser(email, password);
    console.log('Validated user:', user);

    const payload = { sub: user.id, email: user.email, name: user.name };
    const accessToken = await this.jwt.signAsync(payload);

    return { accessToken, access_token: accessToken, user };
  }

  async register(email: string, name: string, password: string) {
    const user = await this.adapter.registerUser(email, name, password);

    const payload = { sub: user.id, email: user.email, name: user.name };
    const accessToken = await this.jwt.signAsync(payload);

    return { accessToken, access_token: accessToken, user };
  }

  async refresh(refreshToken: string) {
    try {

      const payload = await this.jwt.verifyAsync(refreshToken as string);

      const newPayload = {
        sub: (payload as any).sub,
        email: (payload as any).email,
        name: (payload as any).name,
      };

      const accessToken = await this.jwt.signAsync(newPayload);
      return { accessToken, access_token: accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
