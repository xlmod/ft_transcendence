import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private userService: UserService
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		// const reqe: Request = context.switchToHttp().getRequest();
		// const test = reqe.headers['authorization'].split(' ')[1];
		// console.log(req.cookies);
		try {
			// const token = this.jwtService.verify(test);				// keep it for locals test the true method's below
			const token = this.jwtService.verify(req.cookies['access_token']);
			// console.log('jwtguard', token);
			const user = await this.userService.findById(token.uuid);
			// console.log(user);
			if (user.Ban)
				throw Error;
		} catch(error) {
			throw new UnauthorizedException();
		}
		return true;
	}
}