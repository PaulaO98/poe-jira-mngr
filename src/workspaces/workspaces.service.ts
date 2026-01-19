import { Injectable } from '@nestjs/common';
import { AdapterClientService } from '../adapter-client/adapter-client.service';

@Injectable()
export class WorkspacesService {
  constructor(private readonly adapter: AdapterClientService) {}

  create(userId: number, name: string) {
    return this.adapter.createWorkspace(userId, name);
  }

  list(userId: number) {
    console.log('service WorkspacesService.list called with user id:', userId);
    return this.adapter.listWorkspaces(userId);
  }
}
