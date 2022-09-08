import React from 'react';

import './chat.css';

interface IProps
{
	date :string,
	owner :string,
	me :boolean,
	body :string
}

export function Message( props :IProps )
: JSX.Element
{
	if ( props.me )
	{
		return (
			<div className="msg msg-me">
				<p className="msg-sender">{ props.owner }</p>
				<div className="msg-body">
					<p className="msg-text">
						{ props.body }
					</p>
					<p className="msg-date">{ props.date }</p>
				</div>
			</div>
		);
	}
	else
	{
		return (
			<div className="msg msg-them">
				<p className="msg-sender">{ props.owner }</p>
				<div className="msg-body">
					<p className="msg-text">
						{ props.body }
					</p>
					<p className="msg-date">{ props.date }</p>
				</div>
			</div>
		);
	}
}

