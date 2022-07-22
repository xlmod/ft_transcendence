import { IsString } from "class-validator";


export class TwoFactorAuthenticationDto {
	@IsString()
	twoFactorAuthenticationCode: string;
}