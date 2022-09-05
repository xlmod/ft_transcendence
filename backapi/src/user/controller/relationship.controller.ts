import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Put, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { RelationDto } from '../models/relation.dto';
import { UserService } from '../user.service';

/**
 * 
 * @method get():User[]
 * @return all user's friends
 * 
 * @method get(block):string[]|User[]
 * @return all user's id bloked
 * 
 * @method get('add/:id','remove/:id'):User
 * @return respectively follow and unfollow a User, and display the current User instance
 * 
 * @method get('block/:id','unblock/:id'):User
 * @return respectively block and unblock a User's id, and display the current User instance
 * 
 * @method put('add','del'):User
 * @param {RelationDto}
 * @return {User} use the same method [get('add/:id','remove/:id')] but with the User's pseudo
 * 
 * @method patch('block','unblock'):User
 * @param {RelationDto}
 * @return {User} use the same method [get('block/:id','unblock/:id')] but with the User's pseudo
 *  
 */

@Controller('relationship')
@UseGuards(JwtAuthGuard)
export class RelationshipController {
	constructor(private userService: UserService) {}

	@Get()
	async GetAllRelations(@Res({ passthrough: true }) res: Response) {
		return (await this.userService.getfriends(res.locals.uuid)).friends;
	}

	@Get('/block')
	async GetListUBlock(@Res({ passthrough: true }) res: Response) {
		return await this.userService.getublock(res.locals.uuid);
	}

	@Get('/add/:id')
	async addfollow(@Param('id', new ParseUUIDPipe()) id: string, @Res({ passthrough: true }) res: Response) {
		return await this.userService.addfriend(res.locals.uuid, id);
	}

	@Get('/remove/:id')
	async removefollow(@Param('id', new ParseUUIDPipe()) id: string, @Res({ passthrough: true }) res: Response) {
		return await this.userService.delfriend(res.locals.uuid, id);
	}

	@Put('/add')
	async addfollowPseudo(@Req() req, @Res({ passthrough: true }) res: Response, @Body() body: RelationDto) {
		return await this.userService.addpseudo(res.locals.uuid, body.pseudo);
	}

	@Put('/del')
	async delfollowPseudo(@Req() req,  @Res({ passthrough: true }) res: Response, @Body() body: RelationDto) {
		return await this.userService.delpseudo(res.locals.uuid, body.pseudo);
	}


	@Get('block/:id')
	async blockuid(@Param('id', new ParseUUIDPipe()) id: string, @Res({ passthrough: true }) res: Response) {
		return await this.userService.addblockid(res.locals.uuid, id);
		// return 'User blocked';
	}

	@Get('unblock/:id')
	async unblockuid(@Param('id', new ParseUUIDPipe()) id: string, @Res({ passthrough: true }) res: Response) {
		return await this.userService.deblockid(res.locals.uuid, id);
		// return 'User unblocked';
	}
	
	@Patch('/block')
	@HttpCode(200)
	async blockupseudo(@Req() req, @Res({ passthrough: true }) res: Response, @Body() body: RelationDto) {
		return await this.userService.addblock(res.locals.uuid, body.pseudo);
		// return 'User blocked';
	}

	@Patch('/unblock')
	@HttpCode(200)
	async unblockupseudo(@Req() req, @Res({ passthrough: true }) res: Response, @Body() body: RelationDto) {
		return await this.userService.deblock(res.locals.uuid, body.pseudo);
		// return 'User unblocked';
	}
}
