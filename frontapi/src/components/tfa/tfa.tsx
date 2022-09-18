import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import NumericInput from 'react-numeric-input';
import AuthCode from 'react-auth-code-input';

import { iaxios } from '../../utils/axios';
import { AuthContext, useAuth } from '../../services/auth.service';
import { getTFAAuth, postTFACode } from '../utils/requester';

import './tfa.css';

export function TFA()
{
	const {isTFA, waitPostTFACode, isLoggedIn, isLoading} = useAuth();
	const [input, setInput] = useState("");
	const [failed, setFailed] = useState("");

	const handleOnChange = ( res: string ) => {
		setInput( res );
		if( res[0] && res[1] && res[2] && res[3] && res[4] && res[5] )
		{
			waitPostTFACode( res );
		}
	};

	if (isLoading)
		return (<div id="loader"></div>);
	else if (isTFA)
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
	else if (isLoggedIn)
		return (<Navigate to="/game" />)
	else
		return(<Navigate to="/signin" />)
}
