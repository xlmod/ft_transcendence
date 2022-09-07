import { User } from '@/user/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchDto } from './models/match.dto';
import { Match } from './models/match.entity';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(Match) private matchRepository: Repository<Match>,
	) {}

	async create(match: MatchDto) {
		await this.matchRepository.save(match);
	}

	async FindHistoryMatch(user: User) : Promise<MatchDto[]> {
		const lmatch = await this.matchRepository.find({
			where: { luser: user, },
		}).catch(() => {return new Array()});
		const rmatch = await this.matchRepository.find({
			where: { ruser: user, },
		}).catch(() => {return new Array()});
		return lmatch.concat(rmatch).sort((a, b)=> { return b.CreatedAt.getTime() - a.CreatedAt.getTime()})
									.map(match => new MatchDto(match));
	}
}
