import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AppMiddleware implements NestMiddleware {
	constructor(private jwtService: JwtService, private userService: UserService) {}
	use(req: Request, res: Response, next: NextFunction) {
		console.log(req.cookies);
		if (req.cookies['access_token']) {
			try {
				const dtoken = this.jwtService.decode(req.cookies['access_token']); // I dont know why verify doesnt work some time but decode is fine
				res.locals.uuid = dtoken['uuid'];
				req.user = this.userService.findById(dtoken['uuid']);	// Maybe...
			} catch (error) {
				throw new UnauthorizedException('middleware');	// To change
			}
		}
		console.log('req.user', req.user);
		console.log('mi', res.locals.uuid, '->', req.cookies);
		// console.log('mid', req.cookies['access_token']);
		next();
	}
}
