import { useContext } from 'react';
import { AuthContext } from '../../services/auth.service';
import './signin.css';

import { HOST, PORT } from "../../utils/env";

export const Signin = () =>
{
	const {checkLogin} = useContext(AuthContext)
	checkLogin();
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
