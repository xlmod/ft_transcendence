import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class TwoFactorAuthGuard implements CanActivate {
	constructor(
		private readonly authService: AuthService
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		try {
			const user = await this.authService.JwtVerify(req.cookies['tfa_token']);
			if (!user.TwoFactorAuthToggle || !user.TwoFactorAuth)
				throw Error;
		} catch(error) {
			throw new UnauthorizedException('2fa guard failed');
		}
		return true;
	}
}
