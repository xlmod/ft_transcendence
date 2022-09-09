import { iaxios } from '../../utils/axios';

export interface IUser
{
    CreatedAt :string | null,
    TwoFactorAuth :string | null,
    TwoFactorAuthToggle :boolean | null,
    UpdatedAt :string | null,
    avatar :string | null,
    blocks :string | null,
    elo :number | null,
    email :string | null,
    firstName :string | null,
    id :string | null,
    lastName :string | null,
    lose :number | null,
    pseudo :string | null,
    win :number | null,
}

export interface ILeaderboard
{
	elo :number,
	isfriend :boolean,
	pseudo :string,
}

export interface IMatchHistory
{
	CreatedAt :string,
	leftwin :boolean,
	lscore :number,
	luser :IUser,
	rscore :number,
	ruser :IUser,
}

export async function getFriends()
: Promise< IUser[] >
{
	return iaxios.get( 'relationship' )
		.then( data => {
			console.log( "friends" );
			console.log( data.data );
			return data.data;
		} )
		.catch( () => { return [] } );
}

export async function getBlocked()
: Promise< IUser[] >
{
	return iaxios.get( 'relationship/block' )
		.then( data => {
			console.log( "blocked" );
			console.log( data.data );
			return data.data;
		} )
		.catch( () => { return [] } );
}

export async function getLeaderboard()
: Promise< ILeaderboard[] >
{
	return iaxios.get( 'user/leaderboard' )
		.then( data => {
			console.log( "leaderboard" );
			console.log( data.data );
			return data.data;
		} )
		.catch( () => { return [] } );
}

export async function getMatchHistory()
: Promise< IMatchHistory[] >
{
	return iaxios.get( 'match/history' )
		.then( data => {
			console.log( "match history" );
			console.log( data.data );
			return data.data;
		} )
		.catch( () => {
			return [];
		} );
}
