import {useState } from 'react';
import {TFA} from '../tfa/tfa';
import './signin.css';

export const Signin = () =>
{
	/* Call the backspecial end point to check if temp token or not
	 * if
	 * 		temp token redirect tfa ( or load tfa if we don't make tfa a route 
	 * 		better beceuse you can't access tfa if is not needed)
	 **/
	const [tfa, setTfa] = useState(false);


	return (
		<main>
			{tfa ?
			<TFA />
			:
			<section id="sectionSignin">
				<a id="signin" href="http://localhost:3333/auth/42/callback">
					<p>Signin</p>
				</a>
			</section>
			}
		</main>
	);
}
