import React, { useEffect, useState, useRef } from 'react';

import { IUser, getFriends } from '../utils/requester';
import { Message } from './message';
import { Pseudo } from '../utils/pseudo';

import './chat.css';
import { useAuth } from '../../services/auth.service';

export function Chat()
: JSX.Element
{
	const {checkLogin} = useAuth();

	const [msglist, setMsglist] = useState< [ JSX.Element | null ] >( [ null ] );
	const [friends, setFriends] = useState< IUser[] | null >([]);
	const [selectFriends, setSelectFriends] = useState< boolean >( true );
	const [update,updateState] = useState<{}>();

	let inRef = useRef<HTMLInputElement | null>(null);
	let msgRef = useRef<HTMLDivElement | null>(null);

	const addMessage = ( event :React.FormEvent<HTMLFormElement> ) => {
		event.preventDefault();
		const d = new Date();
		let input :HTMLInputElement | null = inRef.current;
		if ( input )
		{
			let value = input.value;
			if( value.trimStart() === "" )
				return;
			input.value = "";
			let l = msglist;
			let msg = <Message date={ d.toLocaleTimeString() } owner="Me" me={ true } body={ value } /> ;
			l.push( msg );
			msg = <Message date={ d.toLocaleTimeString() } owner="Other" me={ false } body={ value } /> ;
			l.push( msg );
			setMsglist( l );
			updateState({});
		}
	}

	const waitFriends = async () => {
		const arrayFriends :IUser[] = await getFriends();
		setFriends( arrayFriends );
	};

	useEffect( () => {
	checkLogin();
	let msgdiv: HTMLDivElement | null = msgRef.current;
		if (msgdiv) {
			msgdiv.scrollTop = msgdiv.scrollHeight;
		}

		waitFriends();
	}, [update] );

		return (
			<main>
				<section id="chat-section">
					<div id="chat-rooms">
						<div id="chat-joined-rooms" className="chat-block">
							<div className="chat-title">Rooms</div>
							<div className="chat-list" >
							</div>
						</div>
						<div id="chat-private-rooms" className="chat-block">
							<div className="chat-title">PRIVMSG</div>
							<div className="chat-list" >
							</div>
						</div>
					</div>
					<div id="chat-content">
						<div id="chat-messages" ref={ msgRef }>
							{ msglist }
						</div>
						<form id="chat-form" onSubmit={ addMessage }>
							<input id="chat-form-input" type="text" name="message" placeholder="Type your message here" ref={ inRef } />
							<input id="chat-form-submit" type="submit" value="Send"/>
						</form>
					</div>
					<div id="chat-users" className="menu">
						<div id="chat-friends" className="chat-block">
							<div className="chat-title">Friends</div>
							<div className="chat-list"  onClick={ () => { updateState({}); } }>
								{ selectFriends
									? ( friends ? friends.map( friend => (
										<Pseudo pseudo={ friend.pseudo ? friend.pseudo : "undefined" }
											pseudoClassName="friends" menuClassName="menu-friends" />
									)) : "" )
									: ""
								}
							</div>
						</div>
						<div id="chat-members" className="chat-block">
							<div className="chat-title">Members</div>
							<div className="chat-list" >
							</div>
						</div>
					</div>
				</section>
			</main>
		);
}
