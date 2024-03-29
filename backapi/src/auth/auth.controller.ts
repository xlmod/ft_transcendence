import { Controller, Get, Param, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthFilter } from './auth.filter';

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
	@UseFilters(AuthFilter)
	async intra42authRedirect(
		@Req() req,
		@Res({ passthrough: true }) res: Response,
	) {
		const user = await this.authService.login(req.user);
		if (!user)
			res.status(401).redirect(`http://${process.env.HOST}:${process.env.FRONT_PORT}`);
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
			pseudo: 'rgfdgdfgg' + ggab
		}
		const guest = await this.authService.loginGuest(user);
		const jtoken = this.jwtService.sign({ uuid: guest.id, tfa: guest.TwoFactorAuthToggle });
		res.cookie('access_token', jtoken, {
			httpOnly: true,
		});
		res.redirect( `http://${process.env.HOST}:${process.env.FRONT_PORT}/game` );
	}
}
