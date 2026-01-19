import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { AdapterClientService } from '../adapter-client/adapter-client.service';

describe('BoardsService', () => {
  let service: BoardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: AdapterClientService,
          useValue: {
            getProjectBoard: jest.fn().mockResolvedValue({ id: 1 }),
            getProjectBoardIssues: jest.fn().mockResolvedValue([]),
            createProjectIssue: jest.fn().mockResolvedValue({ id: 10 }),
            moveProjectIssue: jest.fn().mockResolvedValue({ ok: true }),
          },
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getBoard should return adapter board', async () => {
    const res = await service.getBoard(1, 2);
    expect(res).toEqual({ id: 1 });
  });

  it('getBoardIssues should return adapter issues', async () => {
    const res = await service.getBoardIssues(1, 2);
    expect(res).toEqual([]);
  });

  it('createIssue should forward dto to adapter and return created issue', async () => {
    const dto = { title: 'T' } as any;
    const res = await service.createIssue(1, 2, dto);
    expect(res).toEqual({ id: 10 });
  });

  it('moveIssue should call adapter and return result', async () => {
    const res = await service.moveIssue(1, 5, { columnId: 3 });
    expect(res).toEqual({ ok: true });
  });

  it('createIssue should propagate adapter errors', async () => {
    // replace adapter fn to throw
    (service as any).adapter.createProjectIssue = jest
      .fn()
      .mockRejectedValue(new Error('boom'));
    await expect(
      service.createIssue(1, 2, { title: 'T' } as any),
    ).rejects.toThrow('boom');
  });
});
