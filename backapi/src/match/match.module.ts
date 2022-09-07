import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchService } from './match.service';
import { Match } from './models/match.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Match])],
	providers: [MatchService],
	controllers: [],
	exports: [MatchService],
})
export class MatchModule {}
