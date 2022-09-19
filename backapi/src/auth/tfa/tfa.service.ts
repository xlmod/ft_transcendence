import { Injectable } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode'
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthenticationService {
	constructor(
		private readonly userService: UserService,
	) {}

	public async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.email, process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME, secret);
		await this.userService.setTwoFatorAuthenticationSecret(secret, user.id);
		return { secret, otpauthUrl };
	}

	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}

	public isTwoFactorAuthenticationValid(twoFactorAuthentication: string, user: User) {
		return authenticator.verify({
			token: twoFactorAuthentication,
			secret: user.TwoFactorAuth,
		});
	}
}
