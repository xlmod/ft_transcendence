import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AppMiddleware implements NestMiddleware {
	constructor(private jwtService: JwtService, private userService: UserService) {}
	use(req: Request, res: Response, next: NextFunction) {
		if (req.cookies['tfa_token'] && !req.cookies['access_token']) {
			try {
				const tfa = this.jwtService.decode(req.cookies['tfa_token']);
				res.locals.uuid = tfa['uuid'];
			} catch {};
		}
		if (req.cookies['access_token']) {
			try {
				const dtoken = this.jwtService.decode(req.cookies['access_token']);
				res.locals.uuid = dtoken['uuid'];
			} catch (error) {
				throw new UnauthorizedException();
			}
		}
		next();
	}
}
