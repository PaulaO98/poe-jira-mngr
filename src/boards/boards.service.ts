import { Injectable } from '@nestjs/common';
import {
  AdapterClientService,
  IssuePayload,
  MovePayload,
} from '../adapter-client/adapter-client.service';
import { CreateIssueDto } from './dto/create-issue.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly adapter: AdapterClientService) {}

  getBoard(userId: number, projectId: number) {
    return this.adapter.getProjectBoard(userId, projectId);
  }

  getBoardIssues(userId: number, projectId: number) {
    return this.adapter.getProjectBoardIssues(userId, projectId);
  }

  createIssue(userId: number, projectId: number, dto: CreateIssueDto) {
    return this.adapter.createProjectIssue(
      userId,
      projectId,
      dto as IssuePayload,
    );
  }

  moveIssue(userId: number, issueId: number, dto: MovePayload) {
    return this.adapter.moveProjectIssue(userId, issueId, dto);
  }
}
