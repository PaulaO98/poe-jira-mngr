import {
  Injectable,
  UnauthorizedException,
  BadGatewayException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface AdapterUser {
  id: number;
  email: string;
  name: string;
  password?: string;
}

export interface Workspace {
  id: number;
  name: string;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  workspaceId: number;
  name: string;
  key: string;
  description?: string;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  projectId: number;
  columns: Array<{
    id?: number;
    name?: string;
  }>;
}

export interface Issue {
  id: number;
  title: string;
  projectId: number;
  description?: string;
}

export type IssuePayload = {
  title: string;
  description?: string;
  issueType?: string;
  priority?: string;
  assigneeId?: number;
};

export type MovePayload = Record<string, unknown>;

function isAdapterError(
  err: unknown,
): err is { response?: { status?: number; data?: unknown } } {
  return typeof err === 'object' && err !== null && 'response' in err;
}

@Injectable()
export class AdapterClientService {
  private baseUrl: string;
  private fallbackUserId?: number;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl =
      this.config.get<string>('ADAPTER_BASE_URL') || 'http://localhost:3001';
  }

  async validateUser(email: string, password: string): Promise<AdapterUser> {
    try {
      const res$ = this.http.post<AdapterUser>(
        `${this.baseUrl}/internal/auth/validate`,
        {
          email,
          password,
        },
      );
      const { data } = await firstValueFrom(res$);
      return data;
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async registerUser(
    email: string,
    name: string,
    password: string,
  ): Promise<AdapterUser> {
    try {
      const res$ = this.http.post<AdapterUser>(
        `${this.baseUrl}/internal/auth/register`,
        {
          email,
          name,
          password,
        },
      );
      const { data } = await firstValueFrom(res$);
      return data;
    } catch (e) {
      // Convert adapter / network errors into a clear HTTP exception
      // If axios-like error has a response, include its status and data for easier debugging
      if (isAdapterError(e) && e.response) {
        const status = e.response.status;
        const data = e.response.data;
        // If adapter reports an existing email, forward as 409 Conflict
        if (status === 409) {
          const message = (data as any)?.message || 'Error en el registro';
          throw new ConflictException(message);
        }
        throw new BadGatewayException({
          message: 'Adapter register error',
          status,
          data,
        });
      }
      throw new BadGatewayException('Adapter register error');
    }
  }

  async createWorkspace(userId: number, name: string): Promise<Workspace> {
    this.assertValidUserId(userId);
    const res$ = this.http.post<Workspace>(
      `${this.baseUrl}/internal/workspaces`,
      { name },
      { headers: { 'x-user-id': String(userId) } },
    );
    const { data } = await firstValueFrom(res$);
    return data;
  }

  async listWorkspaces(userId: number): Promise<Workspace[]> {
    this.assertValidUserId(userId);
    const res$ = this.http.get<Workspace[]>(
      `${this.baseUrl}/internal/workspaces`,
      {
        headers: { 'x-user-id': String(userId) },
      },
    );
    const { data } = await firstValueFrom(res$);
    return data;
  }

  async createProject(
    userId: number,
    workspaceId: number,
    payload: { name: string; key: string; description?: string },
  ): Promise<Project> {
    this.assertValidUserId(userId);
    const res$ = this.http.post<Project>(
      `${this.baseUrl}/internal/workspaces/${workspaceId}/projects`,
      payload,
      { headers: { 'x-user-id': String(userId) } },
    );
    const { data } = await firstValueFrom(res$);
    return data;
  }

  async listProjects(userId: number, workspaceId: number): Promise<Project[]> {
    this.assertValidUserId(userId);
    const res$ = this.http.get<Project[]>(
      `${this.baseUrl}/internal/workspaces/${workspaceId}/projects`,
      {
        headers: { 'x-user-id': String(userId) },
      },
    );
    const { data } = await firstValueFrom(res$);
    return data;
  }

  async getProjectBoard(userId: number, projectId: number): Promise<Board> {
    this.assertValidUserId(userId);
    const res$ = this.http.get<Board>(
      `${this.baseUrl}/internal/projects/${projectId}/board`,
      {
        headers: { 'x-user-id': String(userId) },
      },
    );
    const { data } = await firstValueFrom(res$);
    return data;
  }

  async getProjectBoardIssues(
    userId: number,
    projectId: number,
  ): Promise<Issue[]> {
    this.assertValidUserId(userId);
    const res$ = this.http.get<Issue[]>(
      `${this.baseUrl}/internal/projects/${projectId}/board/issues`,
      {
        headers: { 'x-user-id': String(userId) },
      },
    );
    const { data } = await firstValueFrom(res$);
    return data;
  }

  async createProjectIssue(
    userId: number,
    projectId: number,
    payload: IssuePayload,
  ): Promise<Issue> {
    this.assertValidUserId(userId);
    try {
      const res$ = this.http.post<Issue>(
        `${this.baseUrl}/internal/projects/${projectId}/issues`,
        payload,
        { headers: { 'x-user-id': String(userId) } },
      );
      const { data } = await firstValueFrom(res$);
      return data;
    } catch (e) {
      if (isAdapterError(e) && e.response) {
        const status = e.response.status;
        const data = e.response.data;
        // Surface adapter errors as BadGateway with details
        throw new BadGatewayException({
          message: 'Adapter create issue error',
          status,
          data,
        });
      }
      throw new BadGatewayException('Adapter create issue error');
    }
  }

  async moveProjectIssue(
    userId: number,
    issueId: number,
    payload: MovePayload,
  ): Promise<Issue | Record<string, unknown>> {
    this.assertValidUserId(userId);
    try {
      const res$ = this.http.patch<Issue | Record<string, unknown>>(
        `${this.baseUrl}/internal/issues/${issueId}/move`,
        payload,
        { headers: { 'x-user-id': String(userId) } },
      );
      const { data } = await firstValueFrom(res$);
      return data;
    } catch (e) {
      if (isAdapterError(e) && e.response) {
        const status = e.response.status;
        const data = e.response.data;

        throw new BadGatewayException({
          message: 'Adapter move issue error',
          status,
          data,
        });
      }
      throw new BadGatewayException('Adapter move issue error');
    }
  }

  private assertValidUserId(userId: unknown) {
    if (userId === undefined || userId === null) {
      const stack = new Error().stack;
      console.warn(
        '[AdapterClientService.assertValidUserId] userId undefined, fallbackUserId=',
        this.fallbackUserId,
        '\nstack=',
        stack,
      );
      if (this.fallbackUserId) {
        console.info(
          '[AdapterClientService.assertValidUserId] using fallbackUserId=',
          this.fallbackUserId,
        );
        return;
      }
      throw new BadRequestException('Missing x-user-id (userId is undefined)');
    }
    const n = Number(userId);
    if (Number.isNaN(n) || !Number.isFinite(n) || n <= 0) {
      const stack = new Error().stack;
      console.warn(
        '[AdapterClientService.assertValidUserId] userId invalid=',
        userId,
        'fallbackUserId=',
        this.fallbackUserId,
        '\nstack=',
        stack,
      );
      if (this.fallbackUserId) {
        console.info(
          '[AdapterClientService.assertValidUserId] using fallbackUserId=',
          this.fallbackUserId,
        );
        return;
      }
      throw new BadRequestException('Missing or invalid x-user-id header');
    }
  }
}
