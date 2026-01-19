import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import * as YAML from 'yaml';
import { AppModule } from '../src/app.module';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Jira Manager API')
    .setDescription('API pública del MVP tipo Jira (Manager)')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  writeFileSync('openapi.json', JSON.stringify(document, null, 2));
  writeFileSync('openapi.yaml', YAML.stringify(document));

  await app.close();
}

generate();