import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.select(SharedModule).get(ApiConfigService);

  setupSwagger(app);

  const port = configService.appConfig.port;
  await app.listen(port);

  console.info(`server running on ${await app.getUrl()}`);
}
bootstrap();
