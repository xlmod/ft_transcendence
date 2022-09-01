import { Controller, Get, Param, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { nextTick } from 'process';
import { download } from '@/tools/download.tools';


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
		const user = await this.authService.login(req.user);
		if (user === undefined)
			throw new UnauthorizedException();		// maybe remove later
		console.log(user);
		const jtoken = this.jwtService.sign({ uuid: user.id, tfa: user.TwoFactorAuthToggle });

		res.cookie('access_token', jtoken, {
			httpOnly: true,
		});

		res.redirect( 'http://localhost:3000/game' );

		// For 2fa
		// (!user.TwoFactorAuthToggle) ?
		// 	res.redirect( 'http://localhost:3000/game' ) :
		// 	res.redirect( 'http://localhost:3000/tfa' );
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
		res.redirect( 'http://localhost:3000/game' );
	}
}
