import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private svc: ProjectsService) {}

  @Post()
  async create(@Body() body: { name: string }, @Headers('x-demo-userid') uid?: string) {
    if (!uid) return { error: 'Unauthorized' };
  const p = await this.svc.create(body.name, uid);
  // createdAt is added by mongoose timestamps; use safe access
  const createdAt = (p as any).createdAt as Date | undefined;
  return { id: String(p._id), name: p.name, createdAt };
  }

  @Get(':id/members')
  async members(@Param('id') id: string, @Headers('x-demo-userid') uid?: string) {
    if (!uid) return { error: 'Unauthorized' };
    // a simple read check — refine later
    const mem = await this.svc.members(id);
    return mem;
  }
  @Get()
  async myProjects(@Headers('x-demo-userid') uid?: string) {
    if (!uid) throw new UnauthorizedException();
    const rows = await this.svc.listForUser(uid);
    return rows.map((p: any) => ({ id: String(p._id), name: p.name, createdAt: p.createdAt }));
  }
}