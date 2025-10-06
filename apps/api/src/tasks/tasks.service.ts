
import { Injectable } from '@nestjs/common'

type Task = { id: number; title: string; done: boolean }

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    { id: 1, title: 'First task', done: false },
    { id: 2, title: 'Read docs', done: true },
  ]
  private id = 3

  list(): Task[] { return this.tasks }
  create(title: string): Task {
    const t = { id: this.id++, title, done: false }
    this.tasks.push(t)
    return t
  }
}
