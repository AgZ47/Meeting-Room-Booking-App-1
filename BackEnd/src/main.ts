import 'dotenv/config'
import { NestFactory } from '@nestjs/core';
import {SwaggerModule, DocumentBuilder, SwaggerDocumentOptions} from '@nestjs/swagger'
import { AppModule } from './app.module.js';
import { createSchema } from 'zod-openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const documentOptions: SwaggerDocumentOptions = {
    standardSchemaConverter: (schema, { schemaType }) => {
      const converted = createSchema(schema as never, {
        io: schemaType,
        openapiVersion: '3.0.0',
      });
      return { schema: converted.schema, components: converted.components };
    },
  };

  const config = new DocumentBuilder()
                .setTitle('Meeting Room Booking App')
                .setDescription('A web app to coordinate and facilitate easy meeting room booking and time management')
                .setVersion('1.0')
                .addTag('Meeting')
                .build()
  const documentFactory = () => SwaggerModule.createDocument(app,config,documentOptions);
  SwaggerModule.setup('api', app, documentFactory)

  app.enableShutdownHooks();
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
