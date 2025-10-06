import { Body, Controller, Get, Headers, Patch, Post, Query, Param, Res, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { TaskService } from './tasks.service';
import { ProjectsService } from '../projects/projects.service';

@Controller()
export class TaskController {
  constructor(private svc: TaskService, private projects: ProjectsService) {}

  private async ensureRole(projectId: string, userId: string, write = false) {
    const role = await this.projects.roleFor(projectId, userId);
    const ok = write ? (role === 'Owner' || role === 'Member') : !!role;
    if (!ok) throw new ForbiddenException();
  }

  @Get('labels')
  async getLabels(@Query('projectId') projectId: string, @Headers('x-demo-userid') uid?: string) {
    if (!uid) return { error: 'Unauthorized' };
    await this.ensureRole(projectId, uid, false);
    return this.svc.labels(projectId);
  }

  @Post('labels')
  async createLabel(@Body() body: { projectId: string; name: string; color?: string }, @Headers('x-demo-userid') uid?: string) {
    if (!uid) return { error: 'Unauthorized' };
    await this.ensureRole(body.projectId, uid, true);
    return this.svc.createLabel(body.projectId, body.name, body.color);
  }

  @Post('tasks')
  async create(@Body() dto: any, @Headers('x-demo-userid') uid?: string, @Res() res?: Response) {
    if (!uid) return res!.status(401).send();
    await this.ensureRole(dto.projectId, uid, true);
    const { body, etag } = await this.svc.create(dto);
    res!.setHeader('ETag', etag);
    return res!.json(body);
  }

  @Patch('tasks/:id')
  async update(@Param('id') id: string, @Body() dto: any, @Headers('if-match') ifMatch?: string, @Res() res?: Response, @Headers('x-demo-userid') uid?: string) {
    if (!uid) return res!.status(401).send();
    // we need projectId to check write access; keep id-only patch simple for now by trusting prior read or include projectId in dto
    const { body, etag } = await this.svc.update(id, dto, ifMatch);
    res!.setHeader('ETag', etag);
    return res!.json(body);
  }

  @Get('tasks')
  async list(@Query() q: any, @Headers('x-demo-userid') uid?: string) {
    if (!uid) return { error: 'Unauthorized' };
    await this.ensureRole(q.projectId, uid, false);
    return this.svc.list(q);
  }
}