import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './controller/user.controller';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { RelationshipController } from './controller/relationship.controller';
import { MatchModule } from '@/match/match.module';
import { MatchController } from './controller/match.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		forwardRef(() => AuthModule),
		MatchModule,
	],
	providers: [UserService],
	controllers: [
		UserController,
		RelationshipController,
		MatchController
	],
	exports: [UserService],
})
export class UserModule {}
