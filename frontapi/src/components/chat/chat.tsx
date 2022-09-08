import React, { useEffect, useState, useRef } from 'react';

import { iaxios } from '../../utils/axios';
import { IUser, getFriends } from '../utils/requester';
import { Message } from './message';
import { Pseudo } from '../utils/pseudo';

import './chat.css';

export function Chat()
: JSX.Element
{
	const [msglist, setMsglist] = useState< [ JSX.Element | null ] >( [ null ] );
	const [friends, setFriends] = useState< IUser[] | null >([]);
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

/*
	const waitFriends = async () => {
		setFriends(null);
		const arrayFriends :IFriend[] = await getFriends();
		setFriends( arrayFriends );
	};
*/

	useEffect( () => {
		let msgdiv: HTMLDivElement | null = msgRef.current;
		if (msgdiv) {
			msgdiv.scrollTop = msgdiv.scrollHeight;
		}

		getFriends().then( list => { setFriends( list ); } );
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
								{ friends ? friends.map( friend => (
									<Pseudo pseudo={ friend.pseudo ? friend.pseudo : "undefined" }
										isFriend={ true } isBlocked={ false }
										pseudoClassName="friends" menuClassName="menu-friends" />
								)) : "" }
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
