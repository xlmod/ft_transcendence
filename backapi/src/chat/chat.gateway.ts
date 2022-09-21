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
import { ChatService } from './chat.service';
import { Channel } from './channels/channels.entity';
import { MsgDto } from './messages/messages.dto';
import { UserService } from '@/user/user.service';
import { ChannelService } from './channels/channels.service';
import { ChannelState } from './models/status.enums';
import { ChannelUpateDto, CreateChannelDto } from './channels/channels.dto';

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
	private users: Map<string, Set<Socket>> = new Map();

	afterInit(server: Server) {
		server.use(async (socket, next) => {
			try {
				const token = await this.authService.getAccessToken(socket.handshake.headers?.cookie);
				const user = await this.authService.JwtVerify(token);
				const newSet: Set<Socket> = this.users.get(user.id) || new Set<Socket>();
				newSet.add(socket);
				this.users.set(user.id, newSet);
			} catch(e) {
				return next(new UnauthorizedException('Gateway User unknown or failed'));
			}
			next();
		});
	}

	async handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
		const user = await this.chatService.getUserBySocket(client);
		const channels = await this.channelService.findChannelsByUser(user);
		channels?.forEach((elem: Channel) => {
			this.users.get(user.id).forEach(socket => {
				if (socket.id != client.id)
					socket.join(`${elem.id}`);
			})
			client.join(`${elem.id}`);
		});
	}

	async handleDisconnect(client: Socket) {
		const user = await this.chatService.getUserBySocket(client);
		const channels = await this.channelService.findChannelsByUser(user);
		channels?.forEach((elem: Channel) => {
			this.users.get(user.id).forEach(client_socket =>{
				client_socket.leave(`${elem.id}`);
			});
		});
		this.users.forEach((key, value) => {
			if (key.has(client))
			{
				key.forEach(client_socket => {
					if (client_socket.id != client.id)
						client_socket.disconnect(true);
				});
				this.users.delete(value);
			}
		});
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('create-dm')
	async handleCreateDM(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") pseudo: string,
	): Promise<{err: boolean, data: string}> {
		const todm: User = await this.userService.findByPseudo(pseudo);
		const user: User = await this.chatService.getUserBySocket(client);
		const toclient = this.users.get(todm.id);
		if (!todm)
			return ({err: true, data:`User named ${pseudo} not exist!`});
		const channel = await this.channelService.createDMsg(user, todm);
		if (!channel)
			return ({err: true, data:`Channel creation did not succeed!`});
		this.users.get(user.id).forEach(socket_client=>{
			socket_client.join(`${channel.id}`);
			socket_client.emit("update_room_list");
		});
		toclient.forEach(socket_client => {
			socket_client.join(`${channel.id}`);
			socket_client.emit("update_room_list");
		});
		return ({err: false, data:`Channel created!`});
	}

	@SubscribeMessage("create-room")
	async handleCreateRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
		@MessageBody("public") isPublic: boolean,
		@MessageBody("password") password: string,
	): Promise<{err: boolean, data: string}> {
		if (name === "" || !name)
			return ({err: true, data:`$name is empty!`});
		const user: User = await this.chatService.getUserBySocket(client);
		let channel: Channel;
		let state: ChannelState;
		if (isPublic)
			state = (password) ? ChannelState.protected : ChannelState.public;
		else
			state = (password) ?  ChannelState.procated : ChannelState.private;
		try {
			if (state === ChannelState.protected || state === ChannelState.procated)
				channel = await this.channelService.create(user, {name: name, state: state, password: password} as CreateChannelDto);
			else
				channel = await this.channelService.create(user, {name: name, state: state} as CreateChannelDto);
		} catch { return ({err: true, data:`You can't create the channel!`}); }
		this.users.get(user.id).forEach(socket_client=>{
			socket_client.join(`${channel.id}`);
			socket_client.emit("update_room_list");
		});
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
		const user: User = await this.chatService.getUserBySocket(client);
		const channel: Channel = await this.channelService.findByChatName(name);
		try {
			if (password === "")
				await this.channelService.joinChannel(user, channel);
			else
				await this.channelService.joinChannel(user, channel, password);
		} catch { return ({err: true, data:`You can't join the channel!`}); }
		this.server.in(`${channel.id}`).emit("update_members_list");
		this.users.get(user.id).forEach(socket_client=>{
			socket_client.join(`${channel.id}`);
			socket_client.emit("update_room_list");
		});
		return ({err: false, data:`Channel joined!`});
	}

	@SubscribeMessage('update-channel')
	async handleUpdateRoom(
		@ConnectedSocket() client: Socket, 
		@MessageBody("id") id: string,
		@MessageBody("updata") updata: Partial<ChannelUpateDto>
	): Promise<{err: boolean, channel: Channel}> {
		const user: User = await this.chatService.getUserBySocket(client);
		const channel: Channel = await this.channelService.findById(+id);
		if (!channel)
			return ({err: true, channel: undefined});
		await this.channelService.update(user, channel, updata);
		this.server.in(`${channel.id}`).emit("update_room_list");
	}

	@SubscribeMessage('leave-room')
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody("id") id: string,
	): Promise<{err: boolean, data: string}> {
		if (id === "")
			return ({err: true, data:`$name is empty!`});
		const user: User = await this.chatService.getUserBySocket(client);
		const channel: Channel = await this.channelService.findById(+id);
		try {
			await this.channelService.leaveChannel(user, channel)
		} catch { return ({err: true, data:`You can't leave the channel!`}); }
		this.users.get(user.id).forEach(socket_client=>{
			socket_client.leave(`${channel.id}`);
			socket_client.emit("update_room_list");
		});
		this.server.in(`${channel.id}`).emit("update_members_list");
		return ({err: false, data:`Channel leaved!`});
	}


	@SubscribeMessage('send-message')
	async handleSendMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody("id") id: string,
		@MessageBody("msg") msg: string,
	): Promise<{err: boolean, data: any}> {
		if (id === "")
			return ({err: true, data:`$name is empty!`});
		const user: User = await this.chatService.getUserBySocket(client);
		const channel: Channel = await this.channelService.findById(+id);
		const message = await this.channelService.sendMsg(user, channel, msg);
		if (!message)
			return ({err: true, data:`You can't send message to the channel!`});
		this.server.in(`${message.channel.id}`).emit("update_room_list");
		this.server.in(`${message.channel.id}`).emit("update_msg_list", message.channel);
		return ({err:false, data: {channel:message.channel.name, msg: message.msg, user: message.user}});
	}

	@SubscribeMessage('toggle-ban')
	async handleBanUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("id") id: string,
		@MessageBody("uid") uid: string,
	): Promise<{err: boolean, data: string}> {
		const user: User = await this.chatService.getUserBySocket(client);
		const target: User = await this.userService.findById(uid);
		const channel: Channel = await this.channelService.findById(+id);
		if (!(await this.channelService.banUser(user, target, channel)))
			return ({err: true, data:`You can't ban this user from the channel!`});
		this.server.in(`${channel.id}`).emit("update_room", channel);
		return ({err:false, data: `User banned!`});
	}

	@SubscribeMessage('toggle-admin')
	async handleSetAdmin(
		@ConnectedSocket() client: Socket,
		@MessageBody("id") id: string,
		@MessageBody("uid") uid: string,
	): Promise<{err: boolean, data: string}> {
		const user: User = await this.chatService.getUserBySocket(client);
		const channel: Channel = await this.channelService.findById(+id);
		const target: User = await this.userService.findById(uid);
		if (!(await this.channelService.manageAdmin(user, target, channel)))
			return ({err: true, data:`You can't set the user admin on this channel!`});
		this.server.in(`${channel.id}`).emit("update_room", channel);
		return ({err:false, data: `User set admin!`});
	}

	@SubscribeMessage('toggle-mute')
	async handleMuteUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("id") id: string,
		@MessageBody("uid") uid: string,
	): Promise<{err: boolean, data: string}> {
		const user: User = await this.chatService.getUserBySocket(client);
		const target: User = await this.userService.findById(uid);
		const channel: Channel = await this.channelService.findById(+id);
		if (!(await this.channelService.muteUser(user, target, channel)))
			return ({err: true, data:`You can't mute the user on this channel!`});
		this.server.in(`${channel.id}`).emit("update_room", channel);
		return ({err:false, data: `User mutted!`});
	}

	@SubscribeMessage('get-msg')
	async handleGetMsg(
		@ConnectedSocket() client: Socket,
		@MessageBody("id") id: string,
	): Promise<{err: boolean, msg: MsgDto[]}> {
		const channel: Channel = await this.channelService.findById(+id);
		if (!channel)
			return ({err: true, msg: undefined});
		const msg: MsgDto[] = await this.channelService.getMsg(channel);
		if (!msg)
			return ({err: true, msg: undefined});
		return ({err: false, msg: msg});
	}

	@SubscribeMessage('get-members')
	async handleGetMembers(
		@ConnectedSocket() client: Socket,
		@MessageBody("id") id: string,
	): Promise<{err: boolean, members: User[]}> {
		const channel: Channel = await this.channelService.findById(+id);
		if (!channel)
			return ({err: true, members: undefined});
		const members: User[] = await this.channelService.getMembersChannel(channel);
		if (!channel)
			return ({err: true, members: undefined});
		return ({err: false, members: members});
	}

	@SubscribeMessage('delete-channel')
	async handleDeleteRoom(@ConnectedSocket() client: Socket, @MessageBody("id") id: string
	): Promise<{err: boolean, channel: Channel[]}> {
		const channel: Channel = await this.channelService.findById(+id);
		const user: User = await this.chatService.getUserBySocket(client);
		if (!channel)
			return ({err: true, channel: undefined});
		this.server.in(`${channel.id}`).emit("update_room_list");
		return ({err: false, channel: await this.channelService.delete(user, channel)});
	}

	@SubscribeMessage('quit-dm')
	async handleQuitDMsg(@ConnectedSocket() client: Socket, @MessageBody("id") id: string
	): Promise<{err: boolean, data: string}> {
		const channel: Channel = await this.channelService.findById(+id);
		const user: User = await this.chatService.getUserBySocket(client);
		const user2: User = (await this.channelService.findUserListByChannel(channel)).members.find(curr => curr.id !== user.id);
		const channels: Channel[] = await this.channelService.findChannelsByUser(user);
		const match: Channel = channels.find(chat => chat.id === channel.id);
		const toclient = this.users.get(user2.id);
		if (!channel || !channels || !match)
			return ({err: true, data: 'Channel not found'});
		await this.channelService.deleteDMsg(match);
		this.users.get(user.id).forEach(socket_client=>{
			socket_client.emit("update_room_list");
		});
		toclient.forEach(client_socket => {client_socket.emit("update_room_list")});
		return ({err: false, data: 'Channel deleted !'});
	}
}
