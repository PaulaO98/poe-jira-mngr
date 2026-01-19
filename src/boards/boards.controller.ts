import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';
import { BoardsService } from './boards.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { MoveIssueDto } from './dto/move-issue.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/board')
export class BoardsController {
  constructor(private readonly service: BoardsService) {}

  @Get()
  getBoard(
    @Req() req: any,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    console.log(
      '[BoardsController.getBoard] headers.Authorization=',
      req.headers?.authorization,
    );
    console.log('[BoardsController.getBoard] req.user=', req.user);
    return this.service.getBoard(req.user?.id, projectId);
  }

  @Get('issues')
  getBoardIssues(
    @Req() req: any,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    console.log(
      '[BoardsController.getBoardIssues] headers.Authorization=',
      req.headers?.authorization,
    );
    console.log('[BoardsController.getBoardIssues] req.user=', req.user);
    return this.service.getBoardIssues(req.user?.id, projectId);
  }

  @Post('issues')
  createIssue(
    @Req() req: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateIssueDto,
  ) {
    console.log(
      '[BoardsController.createIssue] headers.Authorization=',
      req.headers?.authorization,
    );
    console.log('[BoardsController.createIssue] req.user=', req.user);
    try {
      return this.service.createIssue(req.user?.id, projectId, dto);
    } catch (e) {
      console.error(
        '[BoardsController.createIssue] error before adapter call',
        e,
      );
      throw e;
    }
  }

  @Patch('issues/:issueId/move')
  moveIssue(
    @Req() req: any,
    @Param('issueId', ParseIntPipe) issueId: number,
    @Body() dto: MoveIssueDto,
  ) {
    return this.service.moveIssue(req.user.id, issueId, dto as any);
  }
}
