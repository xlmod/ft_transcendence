import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";
import { User } from "../user.entity";

export class LeaderUserDto {
	@IsNumber()
	rank: number;
	@IsUUID()
	id: string;
	@IsNumber()
	elo: number;
	@IsNotEmpty()
	pseudo: string;

	constructor(rank: number, player: User) {
		this.rank = rank;
		this.id = player.id,
		this.elo = player.elo,
		this.pseudo = player.pseudo
	}
}
