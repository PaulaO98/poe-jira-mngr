import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AdapterClientService } from '../adapter-client/adapter-client.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AdapterClientService,
          useValue: { registerUser: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
