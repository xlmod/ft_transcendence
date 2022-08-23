import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-42';
import { config } from 'dotenv';

config();

export class Intra42Strategy extends PassportStrategy(Strategy, '42') {
	constructor() {
		super({
			clientID: process.env.FORTYTWO_CLIENT_ID,
			clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
			callbackURL: `${process.env.FORTYTWO_CALLBACK_URL}/auth/42/callback`,
			// passReqToCallback: true,
			// proxy: true,
			scope: [ 'public' ],
			redirect_uri: `${process.env.FORTYTWO_CALLBACK_URL}`,
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback,): Promise<any> {
		const { name, emails, photos, username } = profile;
		const user = {
			pseudo: username,
			// pseudo42: username,
			avatar: photos[0].value,
			email: emails[0].value,
			firstName: name.givenName,
			lastName: name.familyName,
		};
		done(null, user);
	}
}
