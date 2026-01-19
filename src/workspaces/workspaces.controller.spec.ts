import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesController', () => {
  let controller: WorkspacesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        {
          provide: WorkspacesService,
          useValue: { list: jest.fn(), create: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('list should call service.list and return entries', async () => {
    const svc = (controller as any).workspacesService;
    svc.list = jest.fn().mockResolvedValue([{ id: 42 }]);

    const req: any = { user: { id: 5 } };
    const res = await controller.list(req);
    expect(res).toEqual([{ id: 42 }]);
  });
});
