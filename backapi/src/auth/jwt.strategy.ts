import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { UserService } from "src/user/user.service";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { User } from "src/user/user.entity";

export default interface TokenPayload {
	uuid: string;
	tfa: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly userService: UserService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
				return req?.cookies?.Authentication;
			}]),
			ignoreExpiration: false,
			secretOrKey: process.env.ACCESS_TOKEN_SECRET,
		});
	}

	async validate(payload: TokenPayload): Promise<User> {
		const user = await this.userService.findById(payload.uuid);
		if (!user) {
			throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
		}
		return user;
	}
}