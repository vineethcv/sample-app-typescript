import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, Label } from './task.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto';

const etagOf = (id: string, version: number) => `W/"${id}:${version}"`;

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private tasks: Model<Task>,
    @InjectModel(Label.name) private labelModel: Model<Label>,
  ) {}

  async create(dto: CreateTaskDto) {
    const t = await this.tasks.create({
      ...dto,
      priority: dto.priority ?? 'Medium',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      labelIds: dto.labelIds ?? []
    });
    return { body: this.toRes(t.toObject()), etag: etagOf(String(t._id), t.version) };
  }

  async update(id: string, dto: UpdateTaskDto, ifMatch?: string) {
    const current = await this.tasks.findById(id).lean();
    if (!current) throw new NotFoundException();
    const tag = etagOf(id, current.version);
    if (!ifMatch || ifMatch !== tag) {
      throw new ConflictException({ message: 'ETag mismatch', resource: this.toRes(current), etag: tag });
    }
    const updated = await this.tasks.findOneAndUpdate(
      { _id: id, version: current.version },
      { $set: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : current.dueDate }, $inc: { version: 1 }, $currentDate: { updatedAt: true } },
      { new: true }
    ).lean();
    if (!updated) {
      const latest = await this.tasks.findById(id).lean();
      const latestTag = etagOf(id, latest!.version);
      throw new ConflictException({ message: 'ETag mismatch', resource: this.toRes(latest!), etag: latestTag });
    }
    return { body: this.toRes(updated), etag: etagOf(id, updated.version) };
  }

  async list(q: { projectId: string; status?: string; assignee?: string; labelId?: string; search?: string; limit?: number; cursor?: string; }) {
    const take = Math.min(Math.max(q.limit ?? 20, 1), 100);
    const filter: any = { projectId: q.projectId };
    if (q.status) filter.status = q.status;
    if (q.assignee) filter.assigneeId = q.assignee;
    if (q.labelId) filter.labelIds = q.labelId;
    if (q.search) filter.$text = { $search: q.search };

    const sort: { [key: string]: 1 | -1 } = { createdAt: -1, _id: -1 };
    if (q.cursor) {
      const { createdAt, _id } = JSON.parse(Buffer.from(q.cursor, 'base64').toString());
      filter.$or = [
        { createdAt: { $lt: new Date(createdAt) } },
        { createdAt: new Date(createdAt), _id: { $lt: _id } }
      ];
    }
    const docs = await this.tasks.find(filter).sort(sort).limit(take + 1).lean();
    let nextCursor: string | null = null;
    let items = docs;
    if (docs.length > take) {
      const last = docs[take - 1];
      nextCursor = Buffer.from(JSON.stringify({ createdAt: last.createdAt, _id: String(last._id) })).toString('base64');
      items = docs.slice(0, take);
    }
    return {
      items: items.map(this.toRes),
      nextCursor
    };
  }

  async labels(projectId: string) {
    const labs = await this.labelModel.find({ projectId }).lean();
    return labs.map(l => ({ id: String(l._id), name: l.name, color: l.color }));
  }

  async createLabel(projectId: string, name: string, color = '#7c3aed') {
    const l = await this.labelModel.create({ projectId, name, color });
    return { id: String(l._id), name: l.name, color: l.color };
  }

  private toRes = (t: any) => ({
    id: String(t._id), projectId: t.projectId, title: t.title, description: t.description ?? null,
    status: t.status, priority: t.priority, dueDate: t.dueDate ?? null, assigneeId: t.assigneeId ?? null,
    labels: (t.labelIds ?? []).map((lid: string) => ({ id: lid, name: lid, color: '#7c3aed' })), // simple; replace with real join/render later
    createdAt: t.createdAt, updatedAt: t.updatedAt, eTag: `W/"${String(t._id)}:${t.version}"`
  });
}