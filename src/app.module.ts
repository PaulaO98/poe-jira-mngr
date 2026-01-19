import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdapterClientModule } from './adapter-client/adapter-client.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { BoardsModule } from './boards/boards.module';

@Module({
  imports: [
    // Load .env or .env.<NODE_ENV> (e.g. .env.production) when present.
    // In production you can set NODE_ENV=production and provide a `.env.production` file
    // or set real environment variables in your host/container.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV
        ? `.env.${process.env.NODE_ENV}`
        : '.env',
      // keep file loading enabled so you can provide `.env.production` if desired
      ignoreEnvFile: false,
    }),
    AuthModule,
    AdapterClientModule,
    WorkspacesModule,
    BoardsModule,
    ProjectsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
