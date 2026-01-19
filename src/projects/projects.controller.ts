import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Post()
  create(
    @Req()
    req: Request & { user?: { id: number; email?: string; name?: string } },
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() dto: CreateProjectDto,
  ) {
    console.log(
      '[ProjectsController.create] headers.Authorization=',
      req.headers?.authorization,
    );
    console.log('[ProjectsController.create] req.user=', req.user);
    // JwtStrategy returns `{ id }` so use `req.user.id` (consistent with other controllers)
    return this.service.create(req.user?.id as number, workspaceId, dto);
  }

  @Get()
  list(
    @Req()
    req: Request & { user?: { id: number; email?: string; name?: string } },
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    console.log(
      '[ProjectsController.list] headers.Authorization=',
      req.headers?.authorization,
    );
    console.log('[ProjectsController.list] req.user=', req.user);
    return this.service.list(req.user?.id as number, workspaceId);
  }
}
