import { IsNotEmpty, IsString } from "class-validator";

export class RelationDto {
	@IsString()
	@IsNotEmpty()
	pseudo: string;
}