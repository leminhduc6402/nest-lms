import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  //config CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: true, // Allows all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Set global prefix for API routes
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI, // Enables versioning via URI
    defaultVersion: '1', // Sets the default version to 1
  });

  await app.listen(configService.get<string>('SERVER_PORT') ?? 3000);
}
bootstrap();
