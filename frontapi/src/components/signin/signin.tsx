import React, { useContext } from 'react';
import { AuthContext } from '../../services/auth.service';
import './signin.css';

export const Signin = () =>
{
	const {checkLogin} = useContext(AuthContext)
	checkLogin();
	return (
		<main>
			<section id="sectionSignin">
				<a id="signin" href="http://localhost:3333/auth/42/callback">
					<p>Signin</p>
				</a>
			</section>
		</main>
	);
}
