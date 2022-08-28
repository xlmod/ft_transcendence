import React, { useContext } from 'react';
import { AuthContext } from '../../services/auth.service';
import { Header } from '../header/header';
import './signin.css';

export const Signin = () =>
{
	const {checkLogin} = useContext(AuthContext)
	checkLogin();
	const user = useContext(AuthContext); 
	return (
		<main>
			<section id="sectionSignin">
				{/* <button id="signin" onClick={ getToken }>
					<p>Sign in</p>
				</button> */}
			<a id="signin" href="http://localhost:3333/auth/42/callback">
				<p>Signin</p>
			</a>
			</section>
		</main>
	);
}
