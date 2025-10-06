import mongoose from 'mongoose';
import { Task, TaskSchema, Label, LabelSchema } from '../tasks/task.schema';
import { Project, ProjectSchema } from '../projects/project.schema';
import { ProjectMember, ProjectMemberSchema } from '../projects/member.schema';

const MONGO = process.env.MONGO_URL || 'mongodb://app:app@127.0.0.1:27017/tasks?authSource=admin';

(async () => {
  await mongoose.connect(MONGO);
  const TaskModel = mongoose.model(Task.name, TaskSchema);
  const LabelModel = mongoose.model(Label.name, LabelSchema);
  const ProjectModel = mongoose.model(Project.name, ProjectSchema);
  const MemberModel = mongoose.model(ProjectMember.name, ProjectMemberSchema);

  await Promise.all([TaskModel.deleteMany({}), LabelModel.deleteMany({}), ProjectModel.deleteMany({}), MemberModel.deleteMany({})]);

  const p = await ProjectModel.create({ name: 'QA Demo Project' });
  await MemberModel.create({ projectId: String(p._id), userId: 'u_demo_1', role: 'Owner' });
  await MemberModel.create({ projectId: String(p._id), userId: 'u_demo_2', role: 'Viewer' });

  const l1 = await LabelModel.create({ projectId: String(p._id), name: 'perf', color: '#7c3aed' });
  const l2 = await LabelModel.create({ projectId: String(p._id), name: 'bug', color: '#dc2626' });

  for (let i = 1; i <= 30; i++) {
    await TaskModel.create({
      projectId: String(p._id),
      title: `Seed Task ${i}`,
      priority: i % 3 === 0 ? 'High' : 'Medium',
      status: i % 5 === 0 ? 'InProgress' : 'Todo',
      dueDate: new Date(Date.now() + (i % 10) * 86400000),
      labelIds: [ ...(i % 2 === 0 ? [String(l1._id)] : []), ...(i % 3 === 0 ? [String(l2._id)] : []) ]
    });
  }
  console.log('Seeded demo data. ProjectId:', String(p._id));
  await mongoose.disconnect();
  process.exit(0);
})();