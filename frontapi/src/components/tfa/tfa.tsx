import React, { useContext, useState } from 'react';
import NumericInput from 'react-numeric-input';
import AuthCode from 'react-auth-code-input';
import { iaxios } from '../../utils/axios';

import { AuthContext } from '../../services/auth.service';
import './tfa.css';

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
			iaxios.post( 'tfa/authenticate' )
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
