import { Controller, Get, Param, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { identity } from 'rxjs';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private jwtService: JwtService,
	) {}

	@Get('42')
	@UseGuards(AuthGuard('42'))
	intra42auth(@Req() req) {}

	@Get('42/callback')
	@UseGuards(AuthGuard('42'))
	async intra42authRedirect(
		@Req() req,
		@Res({ passthrough: true }) res: Response,
	) {
		const user = await this.authService.login42(req.user);
		if (user === undefined)
			throw new UnauthorizedException();		// maybe remove later
		// console.log(user);
		if (user.TwoFactorAuthToggle) {
			const tfa = this.jwtService.sign({uuid: user.id});
			res.cookie('tfa_token', tfa, {
				httpOnly: true,
			});
			res.redirect(`http://${process.env.HOST}:${process.env.FRONT_PORT}/tfa`);
		} else {
			const jtoken = this.jwtService.sign({ uuid: user.id, tfa: user.TwoFactorAuthToggle });
			res.cookie('access_token', jtoken, {
				httpOnly: true,
			});
			res.redirect(`http://${process.env.HOST}:${process.env.FRONT_PORT}/game`);
		}
	}

	@Get('logout')
	async logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('access_token');
	}

	@Get('/guest/:guestdegab')
	async CreateTmpUser(@Param('guestdegab') ggab: any, @Res({ passthrough: true }) res: Response) {
		const user = {
			firstName: ggab,
			lastName: ggab+'1',
			email: ggab+'@local.42.fr',
			pseudo: 'random' + ggab
		}
		const guest = await this.authService.login(user);
		const jtoken = this.jwtService.sign({ uuid: guest.id, tfa: guest.TwoFactorAuthToggle });
		res.cookie('access_token', jtoken, {
			httpOnly: true,
		});
		res.redirect( `http://${process.env.HOST}:${process.env.FRONT_PORT}/game` );
	}
}
