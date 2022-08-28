import { useContext } from 'react';
import { AuthContext } from '../../services/auth.service';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';

import './chat.css';

export function Chat()
: JSX.Element
{
	const {checkLogin} = useContext(AuthContext);
	checkLogin();
	return (
		<main>
			<section id="chatSection">
				<div id="friends">

				</div>
				<div id="chatParent">
					<div id="chat">

					</div>
				</div>
				<div id="channels">

				</div>
			</section>
		</main>
	);
}
