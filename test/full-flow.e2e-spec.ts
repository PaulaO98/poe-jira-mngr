import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  AdapterClientService,
  AdapterUser,
  Workspace,
  Project,
  Board,
  Issue,
} from '../src/adapter-client/adapter-client.service';

class AdapterMock {
  private users = new Map<string, AdapterUser>();
  private workspaces = new Map<number, Workspace[]>();
  private projects = new Map<number, Project[]>();
  private uid = 1;
  private wid = 1;
  private pid = 1;

  validateUser(email: string, password: string) {
    const u = this.users.get(email);
    if (!u || u.password !== password) throw new Error('Invalid credentials');
    return { id: u.id, email: u.email, name: u.name };
  }

  registerUser(email: string, name: string, password: string) {
    if (this.users.has(email)) {
      const err: any = new Error('Email already registered');
      err.response = {
        status: 409,
        data: { message: 'Email already registered' },
      };
      throw err;
    }
    const u: AdapterUser = { id: this.uid++, email, name, password };
    this.users.set(email, u);
    return { id: u.id, email: u.email, name: u.name } as AdapterUser;
  }

  createWorkspace(userId: number, name: string) {
    const workspace: Workspace = {
      id: this.wid++,
      name,
      createdById: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const arr = this.workspaces.get(userId) || [];
    arr.push(workspace);
    this.workspaces.set(userId, arr);
    return workspace;
  }

  listWorkspaces(userId: number) {
    return this.workspaces.get(userId) || [];
  }

  createProject(
    userId: number,
    workspaceId: number,
    payload: Partial<Project>,
  ) {
    const project: Project = {
      id: this.pid++,
      workspaceId,
      name: payload.name || 'proj',
      key: payload.key || `K${this.pid}`,
      description: payload.description,
      createdById: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const arr = this.projects.get(workspaceId) || [];
    arr.push(project);
    this.projects.set(workspaceId, arr);
    return project;
  }

  listProjects(userId: number, workspaceId: number) {
    return this.projects.get(workspaceId) || [];
  }

  getProjectBoard(userId: number, projectId: number) {
    return { projectId, columns: [] } as Board;
  }

  getProjectBoardIssues(userId: number, projectId: number) {
    const issue: Issue = { id: 1, title: 'Issue 1', projectId };
    return [issue];
  }
}

describe('Full flow e2e (mocked adapter)', () => {
  let app: INestApplication;
  const adapterMock = new AdapterMock();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AdapterClientService)
      .useValue(adapterMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register, login, create workspace, create project and fetch board issues', async () => {
    // Register
    const email = 'e2e@example.com';
    const name = 'E2E User';
    const password = 'secret123';

    const reg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, name, password })
      .expect(201);
    expect(reg.body.user.email).toBe(email);

    // Login
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    const token = login.body.accessToken;
    expect(token).toBeTruthy();

    // Create workspace
    const ws = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'E2E Workspace' })
      .expect(201);
    const workspaceId = ws.body.id;

    // Create project
    const proj = await request(app.getHttpServer())
      .post(`/workspaces/${workspaceId}/projects`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'E2E Project', key: 'EP1', description: 'desc' })
      .expect(201);
    const projectId = proj.body.id;

    // Get board issues
    const issues = await request(app.getHttpServer())
      .get(`/projects/${projectId}/board/issues`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(issues.body)).toBe(true);
    expect(issues.body.length).toBeGreaterThan(0);
    expect(issues.body[0].projectId).toBe(projectId);
  });
});
