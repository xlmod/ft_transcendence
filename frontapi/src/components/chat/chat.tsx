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
			<div id="users">
				<div id="friends">
					<h1>Friends</h1>
					<ul>
						<li className="away">Yoda</li>
						<li className="playing">Anakin Skywalker</li>
						<li className="connected">Princess Leïa</li>
					</ul>
				</div>
				<div id="members">
					<h1>Room members</h1>
					<ul>
						<li className="connected">Princess Leïa</li>
					</ul>
				</div>
			</div>
				<div id="chatParent">
					<div id="chat">
					<div id="messages">
						<p className="messages">
							<span className="sender">Princess Leïa__</span>
							<span className="body">Wesh bien ?</span>
						</p>
						<p className="messages">
							<span className="sender">Me__</span>
							<span className="body">42</span>
						</p>
						<p className="messages">
							<span className="sender">Princess Leïa__</span>
							<span className="body">Sinon quoi de neuf ?</span>
						</p>
						<p className="messages">
							<span className="sender">Me__</span>
							<span className="body">42</span>
						</p>

					</div>
						<form>
							<input type="text" name="message" placeholder="Type your message here"/>
							<input type="submit" value="Send"/>
						</form>
					</div>
				</div>
				<div id="channels">
					<h1>Rooms</h1>
					<ul>
						<li>Tatooine</li>
						<li>Starkiller Base</li>
						<li>Naboo</li>
						<li>Dagobah</li>
					</ul>
				</div>
			</section>
		</main>
	);
}
