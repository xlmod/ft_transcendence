import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		// private readonly jwtService: JwtService,
		// private userService: UserService
		private authService: AuthService,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		try {
			await this.authService.JwtVerify(req.cookies['access_token']);
		} catch(error) {
			throw new UnauthorizedException();
		}
		return true;
	}
}