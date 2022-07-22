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
		// console.log(req.user);
		// const user = await this.userService.findById(req.body.id);
		// if (!user)
		// 	throw new NotFoundException();
		const { otpauthUrl } = await
			this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(req.user);
		return this.twoFactorAuthenticationService.pipeQrCodeStream(res, otpauthUrl);
	}

	// @Post('turn-on')
	// @HttpCode(200)
	// // @UseGuards(JwtAuthenticationGuard)
	// async turnOnTwoFactorAuthentication(
	// 	@Req() req,
	// 	@Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationDto,
	// 	@Res({ passthrough: true }) res: Response
	// ) {
	// 	console.log('hello', req);
	// 	const user = await this.userService.findById(req.res.locals.id);
	// 	const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationValid(
	// 		twoFactorAuthenticationCode,
	// 		req.user
	// 	);
	// 	if (!isCodeValid) {
	// 		throw new UnauthorizedException('Wrong authentication code');
	// 	}
	// 	await this.userService.turnTwoFactorAuthentication(req.res.locals.uuid, true);
	// }

	// @Post('turn-off')
	// @HttpCode(200)
	// // @UseGuards(JwtAuthenticationGuard)
	// async turnOnTwoFactorAuthentication(
	// 	@Req() req,
	// 	@Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationDto,
	// 	@Res({ passthrough: true }) res: Response
	// ) {
	// 	// const user = await this.userService.findById(req.res.locals.id);
	// 	const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationValid(
	// 		twoFactorAuthenticationCode,
	// 		req.user
	// 	);
	// 	if (!isCodeValid) {
	// 		throw new UnauthorizedException('Wrong authentication code');
	// 	}
	// 	await this.userService.turnTwoFactorAuthentication(req.res.locals.uuid, false); // or req.user.id
	// }

	@Post('authenticate')
	@HttpCode(200)
	@UseGuards(AuthGuard('jwt-two-factor'))
	async authenticate(
		@Req() req,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationDto,
		@Res({ passthrough: true }) res: Response
	) {
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationValid(twoFactorAuthenticationCode, req.user);
		if (!isCodeValid)
			throw new UnauthorizedException('Wrong authentication code');

		const access_token = this.jwtService.sign({ uuid: req.user.id, tfa: req.user.TwoFactorAuth });
		res.cookie('access_token', access_token, { httpOnly: true });
		// const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(req.user.id, true);
		// req.res.setHeader('Set-Cookie', [accessTokenCookie]);
		return req.user;
	}
}
