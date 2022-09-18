import React  from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../services/auth.service';
import './signin.css';

import { HOST, PORT } from "../../utils/env";

export const Signin = () =>
{
	const {isLoading, isLoggedIn, isTFA, checkLogin} = useAuth();
	// checkLogin();
	if (isLoading)
		return (<div id="loader"></div>);
	else if (isTFA)
		return (<Navigate to="/tfa" />);
	else if (isLoggedIn)
		return (<Navigate to="/game" />);
	return (
		<main>
			<section id="sectionSignin">
				<a id="signin" href={`http://${HOST}:${PORT}/auth/42/callback`}>
					<p>Signin</p>
				</a>
			</section>
		</main>
	);
}
