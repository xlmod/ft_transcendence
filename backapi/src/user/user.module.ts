import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		forwardRef(() => AuthModule),
	],
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService],
})
export class UserModule {}
