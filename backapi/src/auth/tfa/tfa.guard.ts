import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";

@Injectable()
export class TwoFactorAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private userService: UserService
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		try {
			const token = this.jwtService.verify(req.cookies['access_token']);
			const user = await this.userService.findById(token.uuid);
			if (user.Ban || !user.TwoFactorAuthToggle || !user.TwoFactorAuth)
				throw Error;
		} catch(error) {
			throw new UnauthorizedException();
		}
		return true;
	}
}
