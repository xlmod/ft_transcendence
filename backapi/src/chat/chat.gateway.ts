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
import {MsgDto} from './messages/messages.dto';
import {UserService} from '@/user/user.service';
import {ChannelService} from './channels/channels.service';
import {MessageService} from './messages/messages.service';

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
		private messageService: MessageService,
	) {}

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('ChatGateway');

	afterInit(server: Server) {
		server.use(async (socket, next) => {
			const token = this.authService.getAccessToken(socket.handshake?.headers?.cookie);
			if (!token)
				return next(new UnauthorizedException('Gateway auth failed'));
			try {
				const user = await this.authService.JwtVerify(token);
				this.chatService.addSocketId(socket.id, user.id)
			} catch(e) {
				return next(new UnauthorizedException('Gateway User unknown or failed'));
			}
			next();
		});
	}

	async handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
		this.chatService.socketJoinChannels(client);
	}

	async handleDisconnect(client: Socket) {
		this.chatService.removeSocketId(client.id);
		this.chatService.socketLeaveChannels(client);
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
		client.emit("update_room_list");
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
		client.emit("update_room_list");
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
		client.emit("update_room_list");
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
		client.emit("update_room_list");
		return ({err: false, data:`Channel leaved!`});
	}


	@SubscribeMessage('send-message')
	async handleSendMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
		@MessageBody("msg") msg: string,
	): Promise<{err: boolean, data: any}> {
		if (name === "")
			return ({err: true, data:`$name is empty!`});
		const message: {channel:Channel, msg: string, user:string} = await this.chatService.sendMsg(client, name, msg);
		if (message == undefined)
			return ({err: true, data:`You can't send message to the channel!`});
		this.server.in(`${message.channel.id}`).emit("update_room_list");
		this.server.in(`${message.channel.id}`).emit("update_msg_list", message.channel);
		return ({err:false, data: {channel:message.channel.name, msg: message.msg, user: message.user}});
	}

	@SubscribeMessage('ban-user')
	async handleBanUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
		@MessageBody("uid") uid: string,
	): Promise<{err: boolean, data: string}> {
		const user: User = await this.chatService.getUserBySocket(client);
		const channel: Channel = await this.channelService.findByChatName(name);
		const target: User = await this.chatService.getUserByUID(uid);
		if (!(await this.chatService.banUser(channel, user, target)))
			return ({err: true, data:`You can't ban this user from the channel!`});
		this.server.in(`${channel.id}`).emit("update_room_list");
		return ({err:false, data: `User banned!`});
	}

	@SubscribeMessage('unban-user')
	async handleUnbanUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
		@MessageBody("uid") uid: string,
	): Promise<{err: boolean, data: string}> {
		const user: User = await this.chatService.getUserBySocket(client);
		const channel: Channel = await this.channelService.findByChatName(name);
		const target: User = await this.chatService.getUserByUID(uid);
		if (!(await this.chatService.unbanUser(channel, user, target)))
			return ({err: true, data:`You can't unban this user from the channel!`});
		this.server.in(`${channel.id}`).emit("update_room_list");
		return ({err:false, data: `User unbanned!`});
	}

	@SubscribeMessage('set-admin')
	async handleSetAdmin(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
		@MessageBody("uid") uid: string,
	): Promise<{err: boolean, data: string}> {
		const user: User = await this.chatService.getUserBySocket(client);
		const channel: Channel = await this.channelService.findByChatName(name);
		const target: User = await this.chatService.getUserByUID(uid);
		if (!(await this.chatService.setAdmin(channel, user, target)))
			return ({err: true, data:`You can't set the user admin on this channel!`});
		this.server.in(`${channel.id}`).emit("update_room_list");
		return ({err:false, data: `User set admin!`});
	}

	@SubscribeMessage('unset-admin')
	async handleUnsetAdmin(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
		@MessageBody("uid") uid: string,
	): Promise<{err: boolean, data: string}> {
		const user: User = await this.chatService.getUserBySocket(client);
		const channel: Channel = await this.channelService.findByChatName(name);
		const target: User = await this.chatService.getUserByUID(uid);
		if (!(await this.chatService.unsetAdmin(channel, user, target)))
			return ({err: true, data:`You can't unset the user admin on this channel!`});
		this.server.in(`${channel.id}`).emit("update_room_list");
		return ({err:false, data: `User unset admin!`});
	}

	@SubscribeMessage('mute-user')
	async handleMuteUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
		@MessageBody("uid") uid: string,
	): Promise<{err: boolean, data: string}> {
		const user: User = await this.chatService.getUserBySocket(client);
		const channel: Channel = await this.channelService.findByChatName(name);
		const target: User = await this.chatService.getUserByUID(uid);
		if (!(await this.chatService.muteUser(channel, user, target)))
			return ({err: true, data:`You can't mute the user on this channel!`});
		this.server.in(`${channel.id}`).emit("update_room_list");
		return ({err:false, data: `User mutted!`});
	}

	@SubscribeMessage('unmute-user')
	async handleUnmuteUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
		@MessageBody("uid") uid: string,
	): Promise<{err: boolean, data: string}> {
		const user: User = await this.chatService.getUserBySocket(client);
		const channel: Channel = await this.channelService.findByChatName(name);
		const target: User = await this.chatService.getUserByUID(uid);
		if (!(await this.chatService.unmuteUser(channel, user, target)))
			return ({err: true, data:`You can't unmute the user on this channel!`});
		this.server.in(`${channel.id}`).emit("update_room_list");
		return ({err:false, data: `User unmutted!`});
	}

	@SubscribeMessage('get-msg')
	async handleGetMsg(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
	): Promise<{err: boolean, msg: MsgDto[]}> {
		const channel: Channel = await this.channelService.findByChatName(name);
		if (!channel)
			return ({err: true, msg: undefined});
		const msg: MsgDto[] = await this.messageService.getAllMsgByChannel(channel);
		if (!channel)
			return ({err: true, msg: undefined});
		return ({err: false, msg: msg});
	}

}
