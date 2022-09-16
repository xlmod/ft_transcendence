import React from 'react';
import CSS from 'csstype';

import './button.css';

interface IProps {
	id: string,
	value: string,
	fontSize: number,
	onClick: () => void,
}

interface IState {
	style: CSS.Properties,
}

export class Button extends React.Component< IProps, IState > {

	constructor(props: IProps) {
		super(props);
		this.state = {
			style: {
				fontSize: this.props.fontSize + "rem",
			}
		}
	}

	render(): React.ReactNode {
		return(
			<button id={this.props.id} className="generic-button" onClick={this.props.onClick} style={this.state.style}>
				{this.props.value}
			</button>
		);
	}
}
