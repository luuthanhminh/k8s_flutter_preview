import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './modules/projects/projects.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ProjectsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [SharedModule],
    //   useFactory: (configService: ApiConfigService) =>
    //     configService.postgresConfig,
    //   inject: [ApiConfigService],
    // }),
    SharedModule,
  ],
})
export class AppModule {}
