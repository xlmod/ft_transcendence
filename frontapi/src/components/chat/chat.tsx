import { useContext } from 'react';
import { AuthContext } from '../../services/auth.service';

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
						<p className="messages other">
							<span className="sender">Princess Leïa__</span>
							<br/>
							<span className="body">
								Wesh bien ?
								<span className="date">15:03</span>
							</span>
						</p>
						<p className="messages me">
							<span className="sender">Me__</span>
							<br/>
							<span className="body">
								ok
								<span className="date">15:03</span>
							</span>
						</p>
						<p className="messages other">
							<span className="sender">Princess Leïa__</span>
							<br/>
							<span className="body">
								Sinon quoi de neuf ?
								<span className="date">15:03</span>
							</span>
						</p>
						<p className="messages me">
							<span className="sender">Me__</span>
							<br/>
							<span className="body">
								The purpose of lorem ipsum is to create a natural looking block of text (sentence, paragraph, page, etc.)
								<span className="date">15:03</span>
							</span>
						</p>
						<p className="messages other">
							<span className="sender">Princess Leïa__</span>
							<br/>
							<span className="body">
								Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs. The passage is attributed to an unknown typesetter in the 15th century who is thought to have scrambled parts of Cicero's De Finibus Bonorum et Malorum for use in a type specimen book.
								<span className="date">15:03</span>
							</span>
						</p>
						<p className="messages me">
							<span className="sender">Me__</span>
							<br/>
							<span className="body">
								The passage experienced a surge in popularity during the 1960s when Letraset used it on their dry-transfer sheets, and again during the 90s as desktop publishers bundled the text with their software. Today it's seen all around the web; on templates, websites, and stock designs. Use our generator to get your own, or read on for the authoritative history of lorem ipsum. 
								<span className="date">15:03</span>
							</span>
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
