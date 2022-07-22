import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { UserDto } from "src/user/user.dto";
import { UserService } from "src/user/user.service";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { User } from "src/user/user.entity";

// Maybe move interface
export default interface TokenPayload {
	uuid: string;
	tfa?: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		// private readonly configService: ConfigService,
		private readonly userService: UserService,
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
			// throw new UnauthorizedException();
		}
		return user;
	}
}