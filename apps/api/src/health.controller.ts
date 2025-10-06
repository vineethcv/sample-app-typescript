
import { Controller, Get } from '@nestjs/common'

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return { status: 'ok', ts: new Date().toISOString() }
  }
}
