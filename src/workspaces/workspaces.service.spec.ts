import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { AdapterClientService } from '../adapter-client/adapter-client.service';

describe('WorkspacesService', () => {
  let service: WorkspacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: AdapterClientService,
          useValue: { listWorkspaces: jest.fn(), createWorkspace: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should call adapter.createWorkspace and return result', async () => {
    const adapter = (service as any).adapter;
    adapter.createWorkspace.mockResolvedValue({ id: 2, name: 'W' });

    const res = await service.create(1, 'W');
    expect(res).toEqual({ id: 2, name: 'W' });
    expect(adapter.createWorkspace).toHaveBeenCalledWith(1, 'W');
  });

  it('create should propagate adapter errors', async () => {
    const adapter = (service as any).adapter;
    adapter.createWorkspace.mockRejectedValue(new Error('network-ws'));

    await expect(service.create(1, 'W')).rejects.toThrow('network-ws');
  });

  it('list should call adapter.listWorkspaces and return data', async () => {
    const adapter = (service as any).adapter;
    adapter.listWorkspaces.mockResolvedValue([{ id: 10 }]);

    const res = await service.list(1);
    expect(res).toEqual([{ id: 10 }]);
    expect(adapter.listWorkspaces).toHaveBeenCalledWith(1);
  });

  it('list should propagate adapter errors', async () => {
    const adapter = (service as any).adapter;
    adapter.listWorkspaces.mockRejectedValue(new Error('network-list'));

    await expect(service.list(1)).rejects.toThrow('network-list');
  });
});
