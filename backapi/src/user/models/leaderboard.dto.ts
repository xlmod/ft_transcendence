import { IsBoolean, IsNotEmpty, IsNumber, IsUUID } from "class-validator";
import { User } from "../user.entity";

export class LeaderUserDto {
	// @IsUUID()
	// id: string;
	@IsNumber()
	elo: number;
	@IsNotEmpty()
	pseudo: string;
	@IsBoolean()
	isfriend: boolean;

	constructor(player: User, isfriend: boolean) {
		// this.id = player.id,
		this.elo = player.elo,
		this.pseudo = player.pseudo
		this.isfriend = isfriend;
	}
}
