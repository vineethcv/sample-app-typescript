import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema, Label, LabelSchema } from './task.schema';
import { TaskService } from './tasks.service';
import { TaskController } from './tasks.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Label.name, schema: LabelSchema },
    ])
  ],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TasksModule {}