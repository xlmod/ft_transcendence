import React from "react";
import {Button} from "../utils/button";
import {Textinput} from "../utils/textinput";

import './useredit.css'

interface IProps {
	pseudo: string,
	close: () => void,
}

interface IState {
	pseudo: string,
	pseudocolor: string,
}

export class Useredit extends React.Component< IProps, IState > {

	constructor(props: IProps) {
		super(props);

		this.state = {
			pseudo: this.props.pseudo,
			pseudocolor: "var(--cNeon)"
		}

		this.pseudoChange = this.pseudoChange.bind(this);
	}

	pseudoChange(event: any) {
		let pseudo: string = event.target.value;
		if (pseudo.length > 10) {
			this.setState({pseudocolor:"rgba(255,0,0,.5)"})
		} else {
			this.setState({pseudocolor:"var(--cNeon)"})
		}
		this.setState({pseudo: event.target.value})
	}

	render(): React.ReactNode {
		return (
			<section id="useredit-section">
				<div id="useredit-wall">
				</div>
				<div id="useredit-window">
					<div id="useredit-input">

						<Textinput
							id="useredit-input-pseudo"
							placeholder="Pseudo"
							onChange={this.pseudoChange}
							value={this.state.pseudo}
							style={{
								fontSize: '0.8em',
								borderColor: this.state.pseudocolor,
								color: this.state.pseudocolor,
							}}
						/>

					</div>
					<div id="useredit-button">
						<Button id="useredit-button-cancel" value="cancel" fontSize={0.8} onClick={this.props.close} />
						<Button id="useredit-button-save" value="save" fontSize={0.8} onClick={this.props.close} />
					</div>
				</div>
			</section>
		);
	}

}
