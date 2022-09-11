import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import NumericInput from 'react-numeric-input';
import AuthCode from 'react-auth-code-input';

import { iaxios } from '../../utils/axios';
import { AuthContext } from '../../services/auth.service';
import { getTFAAuth, postTFACode } from '../utils/requester';

import './tfa.css';

export function TFA()
{
	const {checkLogin} = useContext(AuthContext);
	checkLogin();
	const [connected, setConnected] = useState< boolean >( true );
	const [input, setInput] = useState("");
	const [failed, setFailed] = useState("");
	const [auth, setAuth] = useState< boolean >( false );

	const waitPostTFACode = async( _code :string ) => {
		const _auth :boolean = await postTFACode( _code );
		setAuth( _auth );
	};

	const handleOnChange = ( res: string ) => {
		setInput( res );
		if( res[0] && res[1] && res[2] && res[3] && res[4] && res[5] )
		{
			waitPostTFACode( res );
		}
	};

	const waitTFAAuth = async() => {
		const _connected :boolean = await getTFAAuth();
		setConnected( _connected );
	};

	useEffect( () => {
		waitTFAAuth();
	}, [] );

	if( !connected || auth )
		return( <Navigate to="/" /> );

	return (
		<main>
			<section id="sectionTFA">
				<h1>Two-Factor Authentication</h1>
				<AuthCode
					inputClassName={ `inputs-children ${failed}` }
					containerClassName="inputs-parent"
					autoFocus={true}
					allowedCharacters='numeric'
					onChange={handleOnChange} />;
			</section>
		</main>
	);
}
