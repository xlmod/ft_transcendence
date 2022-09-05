import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext, useAuth } from '../../services/auth.service';
import './signin.css';

export const Signin = () =>
{
	const {isLoading, isLoggedIn} = useAuth();
	if (isLoading)
		return (<div id="loader"></div>);
	else if (!isLoading && isLoggedIn)
		return (<Navigate to="/game" />);
	else
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
