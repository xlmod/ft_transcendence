import React from 'react';
import { Header } from '../header/header';
import './signin.css';

export function Signin()
:  JSX.Element
{
	return (
		<main>
			<Header />
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
