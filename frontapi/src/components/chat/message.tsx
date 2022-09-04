import React from 'react';


import './chat.css';

interface IProps{
	date: string,
	owner: string,
	me:boolean,
	body: string
}

interface IState {}

export class Message extends React.Component< IProps, IState >
{

	constructor(props: IProps) {
		super(props);
	}

	render(): React.ReactNode {
		if (this.props.me) {
			return (
					<div className="msg msg-me">
						<p className="msg-sender">{this.props.owner}</p>
						<div className="msg-body">
							<p className="msg-text">
								{this.props.body}
							</p>
							<p className="msg-date">{this.props.date}</p>
						</div>
					</div>
			);
		} else {
			return (
					<div className="msg msg-them">
						<p className="msg-sender">{this.props.owner}</p>
						<div className="msg-body">
							<p className="msg-text">
								{this.props.body}
							</p>
							<p className="msg-date">{this.props.date}</p>
						</div>
					</div>
			);
		}
	}
}
