import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { AdapterClientService } from '../adapter-client/adapter-client.service';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: AdapterClientService,
          useValue: { findProjects: jest.fn(), createProject: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
