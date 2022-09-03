import React from 'react';
import {Message} from './message';

import './chat.css';

interface IProps {}

interface IState {
	msglist: [React.ReactNode | null],
}

export class Chat extends React.Component< IProps, IState >
{

	inRef;
	msgRef;
	inelememt: any;
	msgelement: any;

	constructor(props: IProps) {
		super(props);

		this.inelememt = null;
		this.inRef = (element: any) => {this.inelememt = element};
		this.msgelement = null;
		this.msgRef = (element: any) => {this.msgelement = element};

		this.state = {msglist:[null]};

		this.addMessage = this.addMessage.bind(this);
	}


	addMessage(event:React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const d = new Date();
		let input: HTMLInputElement | null = this.inelememt;
		if (input) {
			let value = input.value;
			if (value.trimStart() === "")
				return;
			input.value = "";
			let l = this.state.msglist;
			let msg = <Message date={d.toLocaleTimeString()} owner="Me" me={true} body={value} /> ;
			l.push(msg);
			msg = <Message date={d.toLocaleTimeString()} owner="Other" me={false} body={value} /> ;
			l.push(msg);
			this.setState({msglist:l});
		}
	}

	componentDidUpdate() {
		let msgdiv: HTMLDivElement | null = this.msgelement;
		if (msgdiv) {
			msgdiv.scrollTop = msgdiv.scrollHeight;
		}
	}

	render() {
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
						<div id="chat-messages" ref={this.msgRef}>
							{this.state.msglist}
						</div>
						<form id="chat-form" onSubmit={this.addMessage}>
							<input id="chat-form-input" type="text" name="message" placeholder="Type your message here" ref={this.inRef} />
							<input id="chat-form-submit" type="submit" value="Send"/>
						</form>
					</div>
					<div id="chat-users" className="menu">
						<div id="chat-friends" className="chat-block">
							<div className="chat-title">Friends</div>
							<div className="chat-list" >
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
}
