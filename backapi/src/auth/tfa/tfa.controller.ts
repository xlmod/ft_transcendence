import { Body, ClassSerializerInterceptor, Controller, Get, HttpCode, NotFoundException, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './tfa.service';
import { Response, Request } from 'express';
import { TwoFactorAuthenticationDto } from './tfa.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../../user/user.service';
import { TwoFactorAuthGuard } from './tfa.guard';

@Controller('tfa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	@Get()
	@UseGuards(AuthGuard('jwt-two-factor'))
	async Qrcb(@Res() res: Response) {
		const user = await this.userService.findById(res.locals.uuid);
		const otpauthUrl = 'otpauth://totp/'+process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME+':'+ user.id+'?secret='+user.TwoFactorAuth
							+ '&period=30&digits=6&algorithm=SHA1&issuer=' + process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME;
		return this.twoFactorAuthenticationService.pipeQrCodeStream(res, otpauthUrl);
	}

	@Get('me')
	@UseGuards(TwoFactorAuthGuard)
	async Getmy2faToken(@Res() res: Response) {
		return this.userService.findById(res.locals.uuid);
	}

	@Post('generate')
	async register(@Res() res: Response, @Req() req) {
		const user = await this.userService.findById(res.locals.uuid);
		if (!user)
			throw new NotFoundException();
		if (!user.TwoFactorAuthToggle)
			this.userService.turnTwoFactorAuthentication(user.id, true);
		const { otpauthUrl } = await
		this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);
		return this.twoFactorAuthenticationService.pipeQrCodeStream(res, otpauthUrl);
	}

	@Post('authenticate')
	@HttpCode(200)
	@UseGuards(AuthGuard('jwt-two-factor'))
	async authenticate(
		@Req() req,
		@Body() tfadto: TwoFactorAuthenticationDto,
		@Res({ passthrough: true }) res: Response,
	) {

		const user = await this.userService.findById(res.locals.uuid)
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationValid(tfadto.twoFactorAuthenticationCode, user);
		console.log(isCodeValid, 'ttest');
		if (!isCodeValid)
			throw new UnauthorizedException('Wrong authentication code');

		console.log('Cookies: ', req.cookies);
		res.clearCookie('tfa_token');
		const access_token = this.jwtService.sign({ uuid: user.id, tfa: user.TwoFactorAuthToggle });
		res.cookie('access_token', access_token, { httpOnly: true });
		// const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(user.id, true);
		// res.setHeader('Set-Cookie', [accessTokenCookie]);
		return user;
	}
}
