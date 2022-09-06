import React, { useContext, useState } from 'react';
import NumericInput from 'react-numeric-input';
import AuthCode from 'react-auth-code-input';
import axios from 'axios';

import { AuthContext } from '../../services/auth.service';
import './tfa.css';

const API_URL = "http://localhost:3333/";

export const TFA = () =>
{
	const {checkLogin} = useContext(AuthContext);
	checkLogin();
	const [input, setInput] = useState("");
	const [failed, setFailed] = useState("");

	const handleOnChange = ( res: string ) => {
		setInput( res );
		if( res[0] && res[1] && res[2] && res[3] && res[4] && res[5] )
		{
			axios.get( API_URL + 'tfa/authenticate', { withCredentials: true } )
				.then( ( data :any ) => { } )
				.catch( () => { setFailed( "fail" ); } );
		}
	};

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
