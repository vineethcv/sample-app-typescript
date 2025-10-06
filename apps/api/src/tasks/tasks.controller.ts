
import { Controller, Get, Post, Body } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'

@Controller('tasks')
export class TasksController {
  constructor(private svc: TasksService) {}

  @Get()
  list() { return this.svc.list() }

  @Post()
  create(@Body() dto: CreateTaskDto) { return this.svc.create(dto.title) }
}
