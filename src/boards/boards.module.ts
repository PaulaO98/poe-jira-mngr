import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { AdapterClientModule } from '../adapter-client/adapter-client.module';

@Module({
  imports: [AdapterClientModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
