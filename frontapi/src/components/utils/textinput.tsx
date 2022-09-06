
import React from 'react';
import CSS from 'csstype';

import './textinput.css';

interface IProps {
	id?: string,
	placeholder?: string,
	onChange?: (event:any) => void,
	value?: string,
	style?: CSS.Properties,
	error?: boolean,
	tooltiperror?: string,
}

interface IState {
}

export class Textinput extends React.Component< IProps, IState > {

	constructor(props: IProps) {
		super(props);
	}

	render(): React.ReactNode {
		return(
			<input
				id={this.props.id}
				className={this.props.error ? "generic-textinput-error" : "generic-textinput"}
				onChange={this.props.onChange}
				style={this.props.style}
				placeholder={this.props.placeholder}
				value={this.props.value}
				type="text"
			/>
		);
	}
}
