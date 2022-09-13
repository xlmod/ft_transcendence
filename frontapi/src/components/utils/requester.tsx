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

export function getUser( pseudo :string )
: Promise< IUser >
{
	return iaxios.get( '/user/' + (pseudo === ""?"me":pseudo) )
		.then( data => { return data.data; } )
		.catch( error => { console.log( error ); return ; } );
}

export function getAvatar( uid :string )
: Promise< Blob >
{
	return iaxios({
			method: 'get',
			url: 'filename/' + uid,
			responseType: 'blob',
		})
		.then( data => { return data.data; } )
		.catch( error => { console.log( error ); return ; } );
}

export function getQR()
: Promise< Blob >
{
	return iaxios({
			method: 'get',
			url: 'tfa',
			responseType: 'blob',
		})
		.then( data => { return data.data; } )
		.catch( error => { console.log( error ); return ; } );
}

export function getFriends()
: Promise< IUser[] >
{
	return iaxios.get( 'relationship' )
		.then( data => { return data.data; } )
		.catch( error => { console.log( error ); return [] } );
}

export function getBlocked()
: Promise< IUser[] >
{
	return iaxios.get( 'relationship/block' )
		.then( data => { return data.data; } )
		.catch( error => { console.log( error ); return [] } );
}

export async function getLeaderboard()
: Promise< ILeaderboard[] >
{
	return iaxios.get( 'user/leaderboard' )
		.then( data => { return data.data; } )
		.catch( error => { console.log( error ); return [] } );
}

export function getMatchHistory( uid :string )
: Promise< IMatchHistory[] >
{
	return iaxios.get( 'match/history/' + uid )
		.then( data => { return data.data; } )
		.catch( error => { console.log( error ); return []; } );
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

export function patchPseudo( _pseudo :string )
: Promise< boolean >
{
	return iaxios({
			method: 'patch',
			url: '/user/',
			data: { pseudo: _pseudo },
		})
		.then( () => { return true; } )
		.catch( () => { return false; } );
}


export function patchTFAToggle( _tfa :boolean )
: Promise< boolean >
{
	return iaxios({
			method: 'patch',
			url: 'user',
			data: { TwoFactorAuthToggle: _tfa },
		})
		.then( () => { return true; } )
		.catch( () => { return false; } );
}

export function postTFAToggle()
: Promise< boolean >
{
	return iaxios.post( 'tfa/generate' )
		.then( () => { return true; } )
		.catch( () => { return false; } );
}

export function postAvatar( _avatar :File )
: Promise< boolean >
{
	return iaxios({
			method: 'post',
			url: 'user/upload/avatar',
			data: { file: _avatar },
			headers: { 'Content-Type': 'multipart/form-data' }
		})
		.then( () => { return true ; } )
		.catch( () => { return false; } );
}

export function getTFAAuth()
: Promise< boolean >
{
	return iaxios.get( 'tfa/me' )
		.then( () => { return true; } )
		.catch( () => { return false; } );
}

export function postTFACode( tfaCode :string )
: Promise< boolean >
{
	return iaxios({
		method: 'post',
		url: 'tfa/authenticate',
		data: { twoFactorAuthenticationCode: tfaCode },
	})
	.then( () => { return true; } )
	.catch( () => { return false; } );
}

export function deleteUser()
{
	iaxios.delete( 'user' );
}
