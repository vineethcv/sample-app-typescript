import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './project.schema';
import { ProjectMember } from './member.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private proj: Model<Project>,
    @InjectModel(ProjectMember.name) private member: Model<ProjectMember>,
  ) { }
  async create(name: string, userId: string) {
    const p = await this.proj.create({ name });
    await this.member.create({ projectId: String(p._id), userId, role: 'Owner' });
    return p;
  }
  async members(projectId: string) {
    return this.member.find({ projectId }).lean();
  }
  async roleFor(projectId: string, userId: string): Promise<'Owner' | 'Member' | 'Viewer' | null> {
    const m = await this.member.findOne({ projectId, userId }).lean();
    return (m?.role as any) ?? null;
  }
  async listForUser(userId: string) {
    const mems = await this.member.find({ userId }).lean();
    const ids = mems.map(m => m.projectId);
    if (ids.length === 0) return [];
    return this.proj.find({ _id: { $in: ids } }).lean();
  }
}