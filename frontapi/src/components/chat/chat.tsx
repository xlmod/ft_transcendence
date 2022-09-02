import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../services/auth.service';

import './chat.css';

export function Chat()
: JSX.Element
{

	const {checkLogin} = useContext(AuthContext);
	checkLogin();

	const inRef = useRef<HTMLInputElement | null>(null);

	const [list,setList] = useState<[JSX.Element]>([Message({date:"", owner:"", me:false, body:"Welcome to the chat zone"})]);
	const [,updateState] = useState<{}>();

	const addMessage = (event:React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const d = new Date();
		let input: HTMLInputElement | null = inRef.current;
		if (input) {
			let value = input.value;
			if (value.trimStart() === "")
				return;
			input.value = "";
			const msg = Message({date:d.toLocaleTimeString(), owner:"Me", me: true, body:value});
			let l = list;
			l?.push(msg);
			setList(l);
			updateState({});
		}
	};

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
							<li className="away">Yoda</li>
							<li className="away">Yoda</li>
							<li className="away">Yoda</li>
							<li className="away">Yoda</li>
							<li className="away">Yoda</li>
							<li className="away">Yoda</li>
							<li className="playing">Anakin Skywalker</li>
							<li className="connected">Princess Leïa</li>
							<li className="playing">Anakin Skywalker</li>
							<li className="connected">Princess Leïa</li>
							<li className="playing">Anakin Skywalker</li>
							<li className="connected">Princess Leïa</li>
							<li className="playing">Anakin Skywalker</li>
							<li className="connected">Princess Leïa</li>
							<li className="playing">Anakin Skywalker</li>
							<li className="connected">Princess Leïa</li>
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
						{list}
					</div>
						<form onSubmit={addMessage}>
							<input type="text" name="message" placeholder="Type your message here" ref={inRef} />
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

function Message(props: {date: string, owner: string, me:boolean, body: string})
: JSX.Element
{

	if (props.me) {
		return (
				<p className="messages me">
					<span className="sender">{props.owner}</span>
					<br/>
					<span className="body">
						{props.body}
						<span className="date">{props.date}</span>
					</span>
				</p>
		);
	} else {
		return (
				<p className="messages other">
					<span className="sender">{props.owner}</span>
					<br/>
					<span className="body">
						{props.body}
						<span className="date">{props.date}</span>
					</span>
				</p>
		);
	}
}

/*
						{ Message({date:"16:09", owner:"Me", me:true, body:"The passage experienced a surge in popularity during the 1960s when Letraset used it on their dry-transfer sheets, and again during the 90s as desktop publishers bundled the text with their software. Today it's seen all around the web; on templates, websites, and stock designs. Use our generator to get your own, or read on for the authoritative history of lorem ipsum."})}
						*/
