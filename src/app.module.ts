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
    ConfigModule.forRoot({ isGlobal: true }),
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
