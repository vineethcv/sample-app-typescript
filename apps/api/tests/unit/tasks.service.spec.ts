
import { TasksService } from '../../src/tasks/tasks.service'

describe('TasksService', () => {
  it('lists and creates tasks', () => {
    const svc = new TasksService()
    const start = svc.list().length
    const created = svc.create('new task')
    expect(created.id).toBeGreaterThan(0)
    expect(svc.list().length).toBe(start + 1)
  })
})
