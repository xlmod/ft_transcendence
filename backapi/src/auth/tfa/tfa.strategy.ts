import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import TokenPayload from 'src/auth/jwt.strategy';
import { UserService } from 'src/user/user.service';


@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(Strategy,'jwt-two-factor') {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
			return request?.cookies?.Authentication;
			}]),
			secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
		});
		}

		async validate(payload: TokenPayload) {
		const user = await this.userService.findById(payload.uuid);
		if (!user.TwoFactorAuthToggle) {
			return user;
		}
		if (payload.tfa) {
			return user;
		}
	}
}