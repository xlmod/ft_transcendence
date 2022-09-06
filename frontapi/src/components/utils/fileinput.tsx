
import React from 'react';
import CSS from 'csstype';

import './fileinput.css';

interface IProps {
	id?: string,
	placeholder?: string,
	onChange?: (event:any) => void,
	style?: CSS.Properties,
	error?: boolean,
}

interface IState {
}

export class Fileinput extends React.Component< IProps, IState > {

	constructor(props: IProps) {
		super(props);
	}

	render(): React.ReactNode {
		return(
			<input
				id={this.props.id}
				className={this.props.error ? "generic-fileinput-error" : "generic-fileinput"}
				onChange={this.props.onChange}
				style={this.props.style}
				placeholder={this.props.placeholder != undefined ? this.props.placeholder : ""}
				type="file"
				accept="image/png, image/jpg, image/gif, image/jpeg"
			/>
		);
	}
}
