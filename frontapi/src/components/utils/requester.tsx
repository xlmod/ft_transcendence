import { iaxios } from '../../utils/axios';

export interface IUser
{
    CreatedAt :string,
    TwoFactorAuth :string,
    TwoFactorAuthToggle :boolean,
    UpdatedAt :string,
    avatar :string,
    blocks :string,
    elo :number,
    email :string,
    firstName :string,
    id :string,
    lastName :string,
    lose :number,
    pseudo :string,
    win :number,
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

export function getMe()
: Promise< IUser >
{
	return iaxios.get( '/user/me' )
		.then( data => {
			console.log( 'me' );
			console.log( data.data );
			return data.data;
		} )
		.catch( () => { return } );
}

export function getMePseudo( pseudo :string )
: Promise< IUser >
{
	return iaxios.get( '/user/' + pseudo )
		.then( data => {
			console.log( 'me pseudo' );
			console.log( data.data );
			return data.data;
		} )
		.catch( () => { return } );
}

export function getAvatar( uid :string )
: Promise< File >
{
	return iaxios.get( 'filename/' + uid )
		.then( data => {
			console.log( 'avatar' );
			console.log( typeof( data.data ) );
			return data.data;
		} )
		.catch( ( error ) => {
			console.log( 'failed avatar ' + uid );
			console.log( 'error ' + error );
			return ;
		} );
}

export function getFriends()
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

export function getBlocked()
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

export function getMatchHistory()
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

export function getMatchHistoryID( uid :string )
: Promise< IMatchHistory[] >
{
	return iaxios.get( 'match/history/' + uid )
		.then( data => {
			console.log( "match history " + uid );
			console.log( data.data );
			return data.data;
		} )
		.catch( () => {
			return [];
		} );
}

export function putFriend( _pseudo :string, _which :string )
: Promise< boolean >
{
	return iaxios({
			method: 'put',
			url: 'relationship/' + _which,
			data: { pseudo: _pseudo },
		})
		.then( () => { return true; } )
		.catch( () => { return false; } );
}

export function patchBlock( _pseudo :string, _which :string )
: Promise< boolean >
{
	return iaxios({
			method: 'patch',
			url: 'relationship/' + _which,
			data: { pseudo: _pseudo },
		})
		.then( () => { return true; } )
		.catch( () => { return false; } );
}
