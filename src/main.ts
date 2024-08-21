import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StorageConfig } from 'config/storage.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(StorageConfig.image.destination,{
    prefix: StorageConfig.image.urlPrefix,
  });
  app.useStaticAssets(StorageConfig.video.destination,{
    prefix: StorageConfig.video.urlPrefix,
  });
  app.useStaticAssets(StorageConfig.audio.destination,{
    prefix: StorageConfig.audio.urlPrefix,
  });

  app.enableCors()

  await app.listen(3000);
}
bootstrap();
