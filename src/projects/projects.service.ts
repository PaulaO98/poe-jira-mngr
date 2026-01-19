import { Injectable } from '@nestjs/common';
import { AdapterClientService } from '../adapter-client/adapter-client.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly adapter: AdapterClientService) {}

  create(userId: number, workspaceId: number, dto: any) {
    return this.adapter.createProject(userId, workspaceId, dto);
  }

  list(userId: number, workspaceId: number) {
    return this.adapter.listProjects(userId, workspaceId);
  }
}
