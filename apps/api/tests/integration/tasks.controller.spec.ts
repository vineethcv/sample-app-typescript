
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { TasksModule } from '../../src/tasks/tasks.module'

describe('TasksController (integration)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TasksModule]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /tasks returns list', async () => {
    const res = await request(app.getHttpServer()).get('/tasks').expect(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /tasks creates', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'jest task' })
      .expect(201)
    expect(res.body.title).toBe('jest task')
  })
})
