import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Module({
	imports: [
		UserModule,
		AuthModule,
	],
	providers: [ ChatService, ChatGateway, ],
	controllers: [],
	exports: [],
})
export class ChatModule {}
