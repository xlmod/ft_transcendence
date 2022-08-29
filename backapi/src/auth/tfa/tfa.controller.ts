import { Body, ClassSerializerInterceptor, Controller, HttpCode, NotFoundException, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './tfa.service';
import { Response, Request } from 'express';
import { TwoFactorAuthenticationDto } from './tfa.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../../user/user.service';

@Controller('tfa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	@Post('generate')
	async register(@Res() res: Response, @Req() req) {
		console.log(res.locals.uuid);
		const user = await this.userService.findById(res.locals.uuid);
		if (!user)
			throw new NotFoundException();
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

		const access_token = this.jwtService.sign({ uuid: user.id, tfa: user.TwoFactorAuthToggle });
		res.cookie('access_token', access_token, { httpOnly: true });
		// const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(user.id, true);
		// res.setHeader('Set-Cookie', [accessTokenCookie]);
		return user;
	}
}
