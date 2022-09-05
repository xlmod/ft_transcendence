import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './chat.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Chat]),
		UserModule,
		AuthModule,
	],
	providers: [
		ChatService,
		ChatGateway,
	],
	controllers: [ ChatController ],
	exports: [],
})
export class ChatModule {}
