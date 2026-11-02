// import { NestFactory } from '@nestjs/core';
// import { AppModule, ObserveInstrument } from './app.module.js';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule, {
//     instrument: ObserveInstrument,
//   });
//   await app.listen(process.env.PORT ?? 3000);
// }
// await bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
