import React from 'react';
import axios from 'axios';

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

export function updateUser( value :string, key :( string | number | boolean ) )
{
	axios.patch( 'http://localhost:3333/user', { value: key }, { withCredentials: true } );
}

export function generateQR()
{
	axios.post( 'http://localhost:3333/tfa/generate', Request, { withCredentials: true } );
}
