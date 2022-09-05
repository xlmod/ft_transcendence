import React, { useContext, useState } from 'react';
import NumericInput from 'react-numeric-input';
import AuthCode from 'react-auth-code-input';


import { AuthContext } from '../../services/auth.service';
import './tfa.css';

export const TFA = () =>
{
	const {checkLogin} = useContext(AuthContext);
	checkLogin();
	const [input, setInput] = useState();
	const handleOnChange = ( res: any ) => {
//		if( res.size() === 6 )
		setInput( res );
	};
	return (
		<main>
			<section id="sectionTFA">
				<h1>Two-Factor Authentication</h1>
					<AuthCode inputClassName="inputs-children"
						containerClassName="inputs-parent"
						autoFocus={true}
						allowedCharacters='numeric'
						onChange={handleOnChange} />;
			</section>
		</main>
	);
}
