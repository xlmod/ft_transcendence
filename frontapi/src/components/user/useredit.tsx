import React from "react";
import {Button} from "../utils/button";
import {Fileinput} from "../utils/fileinput";
import {Textinput} from "../utils/textinput";

import { iaxios } from "../../utils/axios";

import './useredit.css'
import {connected} from "process";
import {Navigate} from "react-router";

interface IProps {
	pseudo: string,
	close: (update: boolean) => void,
}

interface IState {
	pseudo: string,
	pseudoerror: boolean,
	avatar: File | null,
	avatarerror: boolean,
	connected: boolean,
}

export class Useredit extends React.Component< IProps, IState > {

	constructor(props: IProps) {
		super(props);

		this.state = {
			pseudo: this.props.pseudo,
			pseudoerror: false,
			avatar: null,
			avatarerror: false,
			connected: true,
		}

		this.pseudoChange = this.pseudoChange.bind(this);
		this.avatarChange = this.avatarChange.bind(this);
		this.onSave = this.onSave.bind(this);
	}

	pseudoChange(event: any) {
		let pseudo: string = event.target.value;
		if (pseudo === "" || pseudo.length > 10) {
			this.setState({pseudoerror: true})
		} else {
			this.setState({pseudoerror: false})
		}
		this.setState({pseudo: pseudo})
	}

	avatarChange(event: any) {
		let file = event.target.files[0];
		if (file.size > Math.pow(2, 20)) {
			this.setState({avatarerror:true})
		} else {
			this.setState({avatarerror: false})
		}
		this.setState({avatar: file})
	}

	async onSave() {
		if (this.state.pseudoerror || this.state.avatarerror) {
			return ;
		}
		if (this.state.pseudo != this.props.pseudo) {
			let connected = await iaxios.patch("/user/", {pseudo: this.state.pseudo}).then((data) => {return true}).catch((err) => {return false});
			if (!connected)
				this.setState({connected: connected})
		}
		if (this.state.avatar != null) {
			console.log(this.state.avatar.name);
			let connected = await iaxios.post("/user/upload/avatar", this.state.avatar).then((data) => {return true}).catch((err) => {return false});
			if (!connected)
				this.setState({connected: connected})
		}
		this.props.close(true);

	}

	render(): React.ReactNode {
		if (!this.state.connected)
			return(<Navigate to="/signin" />);
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
							style={{fontSize: '0.8em'}}
							error={this.state.pseudoerror}
							tooltiperror="max 10 characters"
						/>

						<Fileinput
							id="useredit-input-avatar"
							onChange={this.avatarChange}
							style={{fontSize: '0.8em'}}
							error={this.state.avatarerror}
						/>

						<label style={{fontSize:'0.8em'}}>
							TFA
							<input type="checkbox" />
						</label>

					</div>
					<div id="useredit-button">
						<Button id="useredit-button-cancel" value="cancel" fontSize={0.8} onClick={() => {this.props.close(false)}} />
						<Button id="useredit-button-save" value="save" fontSize={0.8} onClick={this.onSave} />
					</div>
				</div>
			</section>
		);
	}

}
