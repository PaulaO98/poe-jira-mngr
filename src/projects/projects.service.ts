import { Injectable } from '@nestjs/common';
import { AdapterClientService } from '../adapter-client/adapter-client.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly adapter: AdapterClientService) {}

  create(userId: number, workspaceId: number, dto: any) {
    // Normalize project key to adapter-acceptable format: uppercase A-Z0-9 only.
    const normalizedKey =
      typeof dto?.key === 'string'
        ? String(dto.key).toUpperCase().replace(/[^A-Z0-9]/g, '')
        : dto.key;
    const payload = { ...dto, key: normalizedKey };
    return this.adapter.createProject(userId, workspaceId, payload);
  }

  list(userId: number, workspaceId: number) {
    return this.adapter.listProjects(userId, workspaceId);
  }
}
