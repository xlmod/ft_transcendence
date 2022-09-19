import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Channel } from "../channels/channels.entity";
import { CreateMsgDto, MsgDto } from "./messages.dto";
import { Message } from "./messages.entity";

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(Message) private messageRepository: Repository<Message>,
	) {}

	async createMsgDb(message: CreateMsgDto) {
		await this.messageRepository.save(message);
	}

	async getAllMsgByChannel(onchat: Channel): Promise<MsgDto[]> {
		const messages = await this.messageRepository.find({
			where: { channel: onchat },
		}).catch(() => {throw new NotFoundException('This channel doesn\'t exist')});
		return messages.sort((a, b) => {return b.CreatedAt.getTime() - a.CreatedAt.getTime()}).map(msg => new MsgDto(msg));
	}
}