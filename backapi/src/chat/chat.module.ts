import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './channels/channels.entity';
import { Message } from './messages/messages.entity';
import { ChannelService } from './channels/channels.service';
import { MessageService } from './messages/messages.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([ Channel, Message ]),
		UserModule,
		AuthModule,
	],
	providers: [
		ChatService,
		ChatGateway,
		ChannelService,
		MessageService,
	],
	controllers: [ ChatController ],
	exports: [],
})
export class ChatModule {}
