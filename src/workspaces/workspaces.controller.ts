import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';
import { WorkspacesService } from './workspaces.service';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @Req()
    req: Request & { user?: { id: number; email?: string; name?: string } },
    @Body() body: { name: string },
  ) {
    console.log(
      '[WorkspacesController.create] headers.Authorization=',
      req.headers?.authorization,
    );
    console.log('[WorkspacesController.create] req.user=', req.user);
    return this.workspacesService.create(req.user?.id as number, body.name);
  }

  @Get()
  list(
    @Req()
    req: Request & { user?: { id: number; email?: string; name?: string } },
  ) {
    console.log('WorkspacesController.list called with user id:', req.user!.id);
    return this.workspacesService.list(req.user!.id);
  }
}
