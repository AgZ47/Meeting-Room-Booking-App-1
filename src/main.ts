import 'dotenv/config'
import { NestFactory } from '@nestjs/core';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger'
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
                .setTitle('Meeting Room Booking App')
                .setDescription('A web app to coordinate and facilitate easy meeting room booking and time management')
                .setVersion('1.0')
                .addTag('Meeting')
                .build()
  const documentFactory = () => SwaggerModule.createDocument(app,config);
  SwaggerModule.setup('api', app, documentFactory)

  app.enableShutdownHooks();
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
