import { Test, TestingModule } from '@nestjs/testing';
import {
  AdapterClientService,
  IssuePayload,
  MovePayload,
} from './adapter-client.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import {
  BadGatewayException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

describe('AdapterClientService', () => {
  let service: AdapterClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdapterClientService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            patch: jest.fn(),
            put: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://adapter') },
        },
      ],
    }).compile();

    service = module.get<AdapterClientService>(AdapterClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validateUser should return user data on success', async () => {
    const http = (service as unknown as { http: HttpService }).http;
    (http.post as jest.Mock).mockReturnValue(
      of({ data: { id: 1, email: 'a@b', name: 'A' } }),
    );

    const res = await service.validateUser('a@b', 'pwd');
    expect(res).toEqual({ id: 1, email: 'a@b', name: 'A' });
  });

  it('registerUser should throw ConflictException when adapter responds 409', async () => {
    const http = (service as unknown as { http: HttpService }).http;
    const err: unknown = {
      response: { status: 409, data: { message: 'exists' } },
    };
    (http.post as jest.Mock).mockReturnValue(throwError(() => err));

    await expect(
      service.registerUser('a@b', 'A', 'pwd'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('createProjectIssue should return data on success', async () => {
    const http = (service as unknown as { http: HttpService }).http;
    (http.post as jest.Mock).mockReturnValue(
      of({ data: { id: 10, title: 'Issue' } }),
    );

    const res = await service.createProjectIssue(1, 2, { title: 'Issue' });
    expect(res).toEqual({ id: 10, title: 'Issue' });
  });

  it('createProjectIssue should throw BadGatewayException on adapter error with response', async () => {
    const http = (service as unknown as { http: HttpService }).http;
    const err: unknown = {
      response: { status: 500, data: { message: 'boom' } },
    };
    (http.post as jest.Mock).mockReturnValue(throwError(() => err));

    await expect(
      service.createProjectIssue(1, 2, { title: 'Issue' }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('moveProjectIssue should return data on success', async () => {
    const http = (service as unknown as { http: HttpService }).http;
    (http.patch as jest.Mock).mockReturnValue(of({ data: { ok: true } }));

    const res = await service.moveProjectIssue(1, 5, { columnId: 3 });
    expect(res).toEqual({ ok: true });
  });

  it('assertValidUserId throws when userId missing and no fallback', async () => {
    // call a method that triggers assertValidUserId
    await expect(
      service.listWorkspaces(undefined as unknown as number),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('assertValidUserId uses fallback when set', async () => {
    // set private fallbackUserId
    (service as unknown as { fallbackUserId?: number }).fallbackUserId = 99;
    const http2 = (service as unknown as { http: HttpService }).http;
    (http2.get as jest.Mock).mockReturnValue(of({ data: [] }));

    const res = await service.listWorkspaces(undefined as unknown as number);
    expect(res).toEqual([]);
  });

  it('registerUser should throw BadGatewayException when error has no response', async () => {
    const http3 = (service as unknown as { http: HttpService }).http;
    const err2 = new Error('network');
    (http3.post as jest.Mock).mockReturnValue(throwError(() => err2));

    await expect(service.registerUser('x@y', 'X', 'p')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('registerUser should return data on success', async () => {
    const http4 = (service as unknown as { http: HttpService }).http;
    (http4.post as jest.Mock).mockReturnValue(
      of({ data: { id: 7, email: 'b@c', name: 'B' } }),
    );

    const res = await service.registerUser('b@c', 'B', 'pwd');
    expect(res).toEqual({ id: 7, email: 'b@c', name: 'B' });
  });

  it('createProjectIssue should throw generic BadGatewayException when error has no response', async () => {
    const http5 = (service as unknown as { http: HttpService }).http;
    const err3 = new Error('network-create');
    (http5.post as jest.Mock).mockReturnValue(throwError(() => err3));

    await expect(
      service.createProjectIssue(1, 2, { title: 'x' } as IssuePayload),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('validateUser should throw UnauthorizedException on adapter error', async () => {
    const http6 = (service as unknown as { http: HttpService }).http;
    (http6.post as jest.Mock).mockReturnValue(
      throwError(() => new Error('invalid')),
    );

    await expect(service.validateUser('x@y', 'p')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('registerUser should throw BadGatewayException with details when adapter responds non-409', async () => {
    const http7 = (service as unknown as { http: HttpService }).http;
    const err4: unknown = {
      response: { status: 500, data: { message: 'srv' } },
    };
    (http7.post as jest.Mock).mockReturnValue(throwError(() => err4));

    await expect(service.registerUser('u@x', 'U', 'p')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('getProjectBoardIssues should return issues on success and throw on failure', async () => {
    const http8 = (service as unknown as { http: HttpService }).http;
    (http8.get as jest.Mock).mockReturnValueOnce(of({ data: [{ id: 9 }] }));
    const ok = await service.getProjectBoardIssues(1, 33);
    expect(ok).toEqual([{ id: 9 }]);

    const err5 = new Error('network-issues');
    (http8.get as jest.Mock).mockReturnValueOnce(throwError(() => err5));
    await expect(service.getProjectBoardIssues(1, 33)).rejects.toThrow(
      'network-issues',
    );
  });

  it('moveProjectIssue should throw BadGatewayException with response when adapter replies with error response', async () => {
    const http9 = (service as unknown as { http: HttpService }).http;
    const err6: unknown = {
      response: { status: 422, data: { reason: 'bad' } },
    };
    (http9.patch as jest.Mock).mockReturnValue(throwError(() => err6));

    await expect(
      service.moveProjectIssue(1, 55, { columnId: 2 } as MovePayload),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('moveProjectIssue should throw generic BadGatewayException when error has no response', async () => {
    const http10 = (service as unknown as { http: HttpService }).http;
    const err7 = new Error('network-move');
    (http10.patch as jest.Mock).mockReturnValue(throwError(() => err7));

    await expect(
      service.moveProjectIssue(1, 99, { columnId: 1 } as MovePayload),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('assertValidUserId throws on invalid numbers (NaN, 0, negative)', async () => {
    const http11 = (service as unknown as { http: HttpService }).http;
    (http11.get as jest.Mock).mockReturnValue(of({ data: [] }));

    await expect(
      service.listWorkspaces(NaN as unknown as number),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.listWorkspaces(0 as unknown as number),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.listWorkspaces(-5 as unknown as number),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('assertValidUserId uses fallback when invalid number is provided', async () => {
    // set private fallbackUserId
    (service as unknown as { fallbackUserId?: number }).fallbackUserId = 9;
    const http12 = (service as unknown as { http: HttpService }).http;
    (http12.get as jest.Mock).mockReturnValue(of({ data: ['ok'] }));

    const res = await service.listWorkspaces(NaN as unknown as number);
    expect(res).toEqual(['ok']);
  });

  it('createWorkspace should return data on success', async () => {
    const http13 = (service as unknown as { http: HttpService }).http;
    (http13.post as jest.Mock).mockReturnValue(
      of({ data: { id: 2, name: 'W' } }),
    );

    const res = await service.createWorkspace(1, 'W');
    expect(res).toEqual({ id: 2, name: 'W' });
  });

  it('createWorkspace should bubble errors when adapter fails', async () => {
    const http14 = (service as unknown as { http: HttpService }).http;
    const err8 = new Error('network-ws');
    (http14.post as jest.Mock).mockReturnValue(throwError(() => err8));

    await expect(service.createWorkspace(1, 'W')).rejects.toThrow('network-ws');
  });

  it('createProject should return data on success', async () => {
    const http15 = (service as unknown as { http: HttpService }).http;
    (http15.post as jest.Mock).mockReturnValue(
      of({ data: { id: 3, name: 'P' } }),
    );

    const res = await service.createProject(1, 11, { name: 'P', key: 'K' });
    expect(res).toEqual({ id: 3, name: 'P' });
  });

  it('createProject should bubble errors when adapter fails', async () => {
    const http16 = (service as unknown as { http: HttpService }).http;
    const err9 = new Error('network-project');
    (http16.post as jest.Mock).mockReturnValue(throwError(() => err9));

    await expect(
      service.createProject(1, 11, { name: 'P', key: 'K' }),
    ).rejects.toThrow('network-project');
  });

  it('listProjects should return list on success and error on failure', async () => {
    const http17 = (service as unknown as { http: HttpService }).http;
    (http17.get as jest.Mock).mockReturnValueOnce(of({ data: [{ id: 1 }] }));
    const ok = await service.listProjects(1, 11);
    expect(ok).toEqual([{ id: 1 }]);

    const err10 = new Error('network-list');
    (http17.get as jest.Mock).mockReturnValueOnce(throwError(() => err10));
    await expect(service.listProjects(1, 11)).rejects.toThrow('network-list');
  });

  it('getProjectBoard should return board on success and error on failure', async () => {
    const http18 = (service as unknown as { http: HttpService }).http;
    (http18.get as jest.Mock).mockReturnValueOnce(
      of({ data: { board: true } }),
    );
    const ok = await service.getProjectBoard(1, 22);
    expect(ok).toEqual({ board: true });

    const err11 = new Error('network-board');
    (http18.get as jest.Mock).mockReturnValueOnce(throwError(() => err11));
    await expect(service.getProjectBoard(1, 22)).rejects.toThrow(
      'network-board',
    );
  });

  it('constructor should set default baseUrl when config returns undefined', () => {
    const httpMock: unknown = {
      post: jest.fn(),
      patch: jest.fn(),
      put: jest.fn(),
      get: jest.fn(),
    };
    const configMock: Partial<import('@nestjs/config').ConfigService> = {
      get: jest.fn().mockReturnValue(undefined),
    };

    const inst = new AdapterClientService(
      httpMock as HttpService,
      configMock as import('@nestjs/config').ConfigService,
    );
    expect((inst as any).baseUrl).toBe('http://localhost:3001');
  });

  it('constructor should use ADAPTER_BASE_URL from config when provided', () => {
    const httpMock2: unknown = {
      post: jest.fn(),
      patch: jest.fn(),
      put: jest.fn(),
      get: jest.fn(),
    };
    const configMock2: Partial<import('@nestjs/config').ConfigService> = {
      get: jest.fn().mockReturnValue('https://custom-adapter'),
    };

    const inst2 = new AdapterClientService(
      httpMock2 as HttpService,
      configMock2 as import('@nestjs/config').ConfigService,
    );
    expect((inst2 as any).baseUrl).toBe('https://custom-adapter');
    expect((configMock2 as any).get).toHaveBeenCalledWith('ADAPTER_BASE_URL');
  });
});
