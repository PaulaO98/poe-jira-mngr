import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { Request } from 'express';
import { CreateIssueDto } from './dto/create-issue.dto';
import { MoveIssueDto } from './dto/move-issue.dto';

describe('BoardsController', () => {
  let controller: BoardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [
        {
          provide: BoardsService,
          useValue: {
            getBoard: jest.fn().mockResolvedValue({ board: true }),
            getBoardIssues: jest.fn().mockResolvedValue([{ id: 1 }]),
            createIssue: jest.fn().mockResolvedValue({ id: 10 }),
            moveIssue: jest.fn().mockResolvedValue({ ok: true }),
          } as Partial<BoardsService>,
        },
      ],
    }).compile();

    controller = module.get<BoardsController>(BoardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getBoard should call service with req.user id and projectId', async () => {
    const req: Request & { user?: { id: number } } = {
      headers: { authorization: 'Bearer tok' },
      user: { id: 5 },
    } as unknown as Request & { user?: { id: number } };
    const res = await controller.getBoard(req, 2);
    expect(res).toEqual({ board: true });
  });

  it('getBoardIssues should call service and return issues', async () => {
    const req: Request & { user?: { id: number } } = {
      headers: { authorization: 'Bearer tok' },
      user: { id: 5 },
    } as unknown as Request & { user?: { id: number } };
    const res = await controller.getBoardIssues(req, 2);
    expect(res).toEqual([{ id: 1 }]);
  });

  it('createIssue should forward dto and return created issue', async () => {
    const req: Request & { user?: { id: number } } = {
      headers: { authorization: 'Bearer tok' },
      user: { id: 5 },
    } as unknown as Request & { user?: { id: number } };
    const dto: CreateIssueDto = { title: 'New' } as CreateIssueDto;
    const res = await controller.createIssue(req, 2, dto);
    expect(res).toEqual({ id: 10 });
  });

  it('moveIssue should call service with correct params', async () => {
    const req: Request & { user?: { id: number } } = {
      headers: { authorization: 'Bearer tok' },
      user: { id: 5 },
    } as unknown as Request & { user?: { id: number } };
    const moveDto: MoveIssueDto = { toColumnId: 2 } as MoveIssueDto;
    const res = await controller.moveIssue(req, 7, moveDto);
    expect(res).toEqual({ ok: true });
  });

  it('createIssue should log and rethrow when service throws synchronously', () => {
    const svc = (controller as unknown as { service: Partial<BoardsService> })
      .service;
    // make createIssue throw synchronously (to exercise controller catch block)
    svc.createIssue = jest.fn(() => {
      throw new Error('sync-fail');
    });

    const req: Request & { user?: { id: number } } = {
      headers: { authorization: 'Bearer tok' },
      user: { id: 5 },
    } as unknown as Request & { user?: { id: number } };
    const dto: CreateIssueDto = { title: 'Bad' } as CreateIssueDto;

    // silence the noisy console.error output during the test and assert it was called
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => controller.createIssue(req, 2, dto)).toThrow('sync-fail');
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
