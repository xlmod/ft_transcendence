import { useState } from 'react';
import AuthCode from 'react-auth-code-input';
import {iaxios} from '../../utils/axios';

import './tfa.css';


export const TFA = () =>
{
	const [input, setInput] = useState("");
	const [failed, setFailed] = useState("");

	const handleOnChange = ( res: string ) => {
		setInput( res );
		if( res[0] && res[1] && res[2] && res[3] && res[4] && res[5] )
		{
			iaxios.get("tfa")
				.then( () => { } )
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
