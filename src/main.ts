import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Jira MVP Manager API')
    .setDescription('API documentation for the Jira MVP Manager application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.getHttpAdapter().get('/openapi.json', (req, res) => {
    res.json(document);
  });

  app.getHttpAdapter().get('/openapi.yaml', async (req, res) => {
    const yaml = await import('yaml');
    res.type('text/yaml').send(yaml.stringify(document));
  });

  // Enable CORS only for an explicit allowed origin (set via env: ALLOWED_ORIGIN).
  const allowedOrigin = ['http://localhost:4200', 'https://d3bls25kf0ic9h.cloudfront.net'];
  if (allowedOrigin) {
    app.enableCors({ origin: allowedOrigin });
  }

  const portFromConfig = configService.get<string>('PORT');
  const port = Number(portFromConfig ?? process.env.PORT ?? 3000);
  await app.listen(port);
}
bootstrap();
