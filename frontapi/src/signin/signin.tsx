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
				<div id="signin">
					<p>Sign in</p>
				</div>
			</section>
		</main>
	);
}
