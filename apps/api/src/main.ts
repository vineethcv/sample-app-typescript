import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'If-Match',
      'X-Demo-UserId',   // <-- custom header we send from the SPA
    ],
    exposedHeaders: [
      'ETag',            // <-- so the browser lets us read ETag
    ],
    credentials: true,   // <-- because fetch() uses credentials: 'include'
  });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();