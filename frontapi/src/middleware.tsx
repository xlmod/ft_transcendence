import React from 'react';
import axios from 'axios';

export function getToken()
{
	axios
	.get( "http://localhost:3333/auth/42/callback" );
}
