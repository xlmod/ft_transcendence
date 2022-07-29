import React from 'react';
import { Header } from '../header/header';
import { getToken } from '../middleware';
import './signin.css';

export function Signin()
:  JSX.Element
{
	return (
		<main>
			<Header />
			<section id="sectionSignin">
				<button id="signin" onClick={ getToken }>
					<p>Sign in</p>
				</button>
			</section>
		</main>
	);
}
