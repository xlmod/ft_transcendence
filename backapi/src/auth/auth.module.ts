import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { Intra42Strategy } from './intra42.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TwoFactorAuthenticationService } from './tfa/tfa.service';
import { TwoFactorAuthenticationController } from './tfa/tfa.controller';
import { JwtTwoFactorStrategy } from './tfa/tfa.strategy';

@Module({
	imports: [
		forwardRef(() => UserModule),
		JwtModule.register({
			secret: process.env.ACCESS_TOKEN_SECRET,
			signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION },
		}),
	],
	providers: [
		AuthService,
		JwtStrategy,
		Intra42Strategy,
		JwtAuthGuard,
		TwoFactorAuthenticationService,
		JwtTwoFactorStrategy,
	],
	controllers: [
		AuthController,
		TwoFactorAuthenticationController
	],
	exports: [
		AuthService,
		//	Need in Guard and Extern Controller
		JwtModule.register({
			secret: process.env.ACCESS_TOKEN_SECRET,
			signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION },
		}),
	],
})
export class AuthModule {}
