import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import TokenPayload from 'src/auth/jwt.strategy';
import { UserService } from 'src/user/user.service';


@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(Strategy, 'jwt-two-factor') {
	constructor(
		private readonly userService: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request: any) => {
				return request.cookies['tfa_token'];
			}]),
			secretOrKey: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
		});
	}

	async validate(payload: TokenPayload) {
		const user = await this.userService.findById(payload.uuid);
		if (user.TwoFactorAuthToggle) {
			return user;
		}
	}
}