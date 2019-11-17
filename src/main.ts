import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  const config = app.get('ConfigService');
  const port = config.get('APP_PORT');
  const host = config.get('APP_HOST');
  await app.listen(port, host);
  const logger = new Logger();
  logger.log(`Application available at http://${host}:${port}/`);
}
bootstrap();
