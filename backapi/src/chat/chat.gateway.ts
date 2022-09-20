import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer } from '@nestjs/websockets';
import { AllExceptionsFilter } from '@/game/game.filter';
import { Logger, UnauthorizedException, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { AuthService } from '@/auth/auth.service';
import { User } from '@/user/user.entity';
import {ChatService} from './chat.service';
import {Channel} from './channels/channels.entity';
import {UserService} from '@/user/user.service';
import {ChannelService} from './channels/channels.service';

UsePipes(new ValidationPipe())
@UseFilters(AllExceptionsFilter)
@WebSocketGateway({
	cors: {
		origin: [`http://${process.env.HOST}:${process.env.FRONT_PORT}`,
				 `http://${process.env.HOST}:${process.env.PORT}`],
		credentials: true
	},
	namespace: '/chat',
})

export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private chatService: ChatService,
		private userService: UserService,
		private channelService: ChannelService,
	) {}

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('ChatGateway');
	private users = new Map<string, User>();

	afterInit(server: Server) {
		server.use(async (socket, next) => {
			const cookie = socket.handshake.headers.cookie.split(';');
			if (!cookie)
				return next(new UnauthorizedException('ChatGateway auth failed'));
			try {
				const token = cookie.filter(cookie => {
					if (cookie.split('=')[0] === 'access_token')
						return cookie;
				})[0].split('=')[1];
				this.users.set(socket.id, await this.authService.JwtVerify(token));
			} catch(e) {
				return next(new UnauthorizedException('ChatGateway User unknow or failed'));
			}
			next();
		});
	}

	async handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	async handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('create-dm')
	async handleCreateDM(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
	): Promise<{err: boolean, data: string}> {
		const touser: User = await this.userService.findByPseudo(name);
		if (touser == undefined)
			return ({err: true, data:`User named ${name} not exist!`});
		const user: User = await this.chatService.getUserBySocket(client);
		const channel = await this.channelService.createDMsg(user, touser);
		if (channel == undefined)
			return ({err: true, data:`Channel creation did not succeed!`});
		client.join(`${channel.id}`);
		return ({err: false, data:`Channel created!`});
	}

	@SubscribeMessage("create-room")
	async handleCreateRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
		@MessageBody("public") is_public: boolean,
		@MessageBody("password") password: string,
	): Promise<{err: boolean, data: string}> {
		// console.log(this.users)
		if (name === "")
			return ({err: true, data:`$name is empty!`});
		const channel: Channel = await this.chatService.createChannel(client, name, is_public, password);
		if (channel == undefined)
			return ({err: true, data:`You can't create the channel!`});
		client.join(`${channel.id}`);
		return ({err: false, data:`Channel created!`});
	}
	
	@SubscribeMessage('join-room')
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
		@MessageBody("password") password: string,
	): Promise<{err: boolean, data: string}> {
		if (name === "")
			return ({err: true, data:`$name is empty!`});
		const channel: Channel = await this.chatService.joinChannel(client, name, password)
		if (channel == undefined)
			return ({err: true, data:`You can't join the channel!`});
		client.join(`${channel.id}`);
		return ({err: false, data:`Channel joined!`});
	}

	@SubscribeMessage('leave-room')
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
	): Promise<{err: boolean, data: string}> {
		if (name === "")
			return ({err: true, data:`$name is empty!`});
		const channel: Channel = await this.chatService.leaveChannel(client, name)
		if (channel == undefined)
			return ({err: true, data:`You can't leave the channel!`});
		client.leave(`${channel.id}`);
		return ({err: false, data:`Channel leaved!`});
	}

	
	@SubscribeMessage('send-message')
	async handleMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
	): Promise<{err: boolean, data: string}> {
		if (name === "")
			return ({err: true, data:`$name is empty!`});
		const channel: Channel = await this.chatService.leaveChannel(client, name)
		if (channel == undefined)
			return ({err: true, data:`You can't send message to the channel!`});
		this.server.in(`${channel.id}`).emit("updage_room_list");
	}
}
