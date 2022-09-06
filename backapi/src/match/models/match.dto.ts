import { User } from "@/user/user.entity";
import { Match } from "./match.entity";

export class MatchDto {
	luser: User;
	lscore: number;
	ruser: User;
	rscore: number;
	leftwin: boolean;
	CreatedAt: Date;

	constructor(match: Match) {
		this.luser = match.luser;
		this.lscore = match.lscore;
		this.ruser = match.ruser;
		this.rscore = match.rscore;
		this.leftwin = match.leftwin;
		this.CreatedAt = match.CreatedAt;
	}
}