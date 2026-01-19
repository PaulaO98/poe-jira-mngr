import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: { create: jest.fn(), list: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create and return value', async () => {
    const svc = (controller as any).service;
    svc.create = jest.fn().mockResolvedValue({ id: 11, name: 'P' });

    const req: any = {
      headers: { authorization: 'Bearer tok' },
      user: { id: 2 },
    };
    const dto = { name: 'P', key: 'K' } as any;
    const res = await controller.create(req, 5, dto);
    expect(res).toEqual({ id: 11, name: 'P' });
  });

  it('list should call service.list and return items', async () => {
    const svc = (controller as any).service;
    svc.list = jest.fn().mockResolvedValue([{ id: 1 }]);

    const req: any = {
      headers: { authorization: 'Bearer tok' },
      user: { id: 2 },
    };
    const res = await controller.list(req, 5);
    expect(res).toEqual([{ id: 1 }]);
  });
});
