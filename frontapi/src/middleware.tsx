import axios from 'axios';
import { useState } from "react";

export function getToken()
{
	const AuthHandler = () => window.open('http://localhost:3333/auth/42/callback', '_self');
	axios.get(`${AuthHandler()}`);
	// return `http://localhost:3000`;
	// axios.get( "http://localhost:3333/auth/42/callback");
	// console.log( test );
	// <a href="http://localhost:3001/api/account/linkedin">SSSSS
    	// {/* <button>SSSSSS</button> */}
	// </a>
}

export function logout()
{
	axios.get( 'http://localhost:3333/auth/logout', { withCredentials: true } );
}

export function updateUser( value :string, key :( string | number | boolean ) )
{
	axios.patch( 'http://localhost:3333/user', { value: key }, { withCredentials: true } );
}

export function generateQR() /* Move this to backend */
{
	axios.post( 'http://localhost:3333/tfa/generate', Request, { withCredentials: true } );
}

export function authenticateQR()
{
	axios.post( 'http://localhost:3333/tfa/authenticate', { withCredentials: true } );
}

export function amIAuthorized()
: boolean
{
/*
	const ax = async () => {
		const auth = await axios.get( 'http://localhost:3333/user/me', { withCredentials: true } )
		.then( response => { console.log( 'inside response' ); return true; } )
		.catch( error => { console.log( 'inside error' ); return false } );
		return auth;
	};

	await ax();
*/

/*
	const [ auth, setAuth ] = useState<boolean>(false);

	axios.get( 'http://localhost:3333/user/me', { withCredentials: true } )
	.then( response => { setAuth(true); console.log( 'inside response' ); } )
	.catch( error => { console.log( 'inside error' ); return false } )

	console.log( auth );
*/
	return true;
}
