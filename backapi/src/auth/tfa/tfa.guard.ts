import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { AuthService } from "../auth.service";

@Injectable()
export class TwoFactorAuthGuard implements CanActivate {
	constructor(
		private readonly authService: AuthService
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		try {
			const user = await this.authService.JwtVerify(req.cookies['access_token']);
			if (!user.TwoFactorAuthToggle || !user.TwoFactorAuth)
				throw Error;
		} catch(error) {
			throw new UnauthorizedException();
		}
		return true;
	}
}
