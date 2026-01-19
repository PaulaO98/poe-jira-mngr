import { Injectable } from '@nestjs/common';
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

    // Provide both camelCase and snake_case token fields for clients
    return { accessToken, access_token: accessToken, user };
  }

  async register(email: string, name: string, password: string) {
    const user = await this.adapter.registerUser(email, name, password);

    const payload = { sub: user.id, email: user.email, name: user.name };
    const accessToken = await this.jwt.signAsync(payload);

    return { accessToken, access_token: accessToken, user };
  }
}
