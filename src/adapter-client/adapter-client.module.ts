import { Module } from '@nestjs/common';
import { AdapterClientService } from './adapter-client.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AdapterClientService],
  exports: [AdapterClientService],
})
export class AdapterClientModule {}
