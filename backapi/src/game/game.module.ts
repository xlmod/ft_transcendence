import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
	imports: [
		UserModule,
		AuthModule,
	],
	controllers: [],
	providers: [GameService, GameGateway, JwtService ],
})
export class GameModule {}
