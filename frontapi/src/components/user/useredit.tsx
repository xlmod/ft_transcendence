import { useState } from "react";
import {Navigate} from "react-router";

import { iaxios } from "../../utils/axios";
import { patchPseudo, postTFA, patchTFA, postAvatar } from '../utils/requester';
import {Button} from "../utils/button";
import {Fileinput} from "../utils/fileinput";
import {Textinput} from "../utils/textinput";
import {ToggleSwitch} from "../utils/toggleswitch";

import './useredit.css'

interface IProps {
	pseudo: string,
	tfa: boolean,
	close: (update: boolean) => void,
}

export function Useredit(props: IProps) {

	const [pseudo, setPseudo] = useState<string>(props.pseudo);
	const [pseudoerror, setPseudoerror] = useState<boolean>(false);
	const [avatar, setAvatar] = useState<File | null>(null);
	const [avatarerror, setAvatarerror] = useState<boolean>(false);
	const [tfa, setTfa] = useState<boolean>(props.tfa);
	const [connected, setConnected] = useState<boolean>(true);

	const pseudoChange = (event: any) => {
		let value: string = event.target.value;
		if (value === "" || value.length > 10) {
			setPseudoerror(true);
		} else {
			setPseudoerror(false);
		}
		setPseudo(value);
	};

	const avatarChange = (event: any) => {
		let file = event.target.files[0];
		if (file.size > Math.pow(2, 20)) {
			setAvatarerror(true);
		} else {
			setAvatarerror(false);
		}
//		console.log( 'avatar ' + avatarerror );
//		console.log( file );
		setAvatar(file);
	};

	const tfaChange = (event: any) => {
		setTfa(event.target.checked);
	};

	const onSave = async () => {
		if (pseudoerror || avatarerror) {
			return ;
		}
		if (pseudo != props.pseudo) {
			let connected = await patchPseudo( pseudo );
			if (!connected)
				setConnected(connected);
		}
		if (avatar != null) {
			let connected = await postAvatar( avatar );
			if (!connected)
				setConnected(connected);
		}
		console.log( 'new tfa ' + tfa );
		console.log( 'old tfa ' + props.tfa );
		if (tfa != props.tfa) {
			let connected = await tfa?postTFA():patchTFA( false );
			if (!connected)
				setConnected(connected);
		}
		props.close(true);

	};

	if (!connected)
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
						onChange={pseudoChange}
						value={pseudo}
						style={{fontSize: '0.8em'}}
						error={pseudoerror}
						tooltiperror="max 10 characters"
					/>

					<Fileinput
						id="useredit-input-avatar"
						onChange={avatarChange}
						style={{fontSize: '0.8em'}}
						error={avatarerror}
					/>

					<label>
					<span id="useredit-input-toggle-label">2FA</span>
					<ToggleSwitch
						id="useredit-input-toggle"
						checked={tfa}
						onChange={tfaChange}
						
					/>
					</label>

				</div>
				<div id="useredit-button">
					<Button id="useredit-button-cancel" value="cancel" fontSize={0.8} onClick={() => {props.close(false)}} />
					<Button id="useredit-button-save" value="save" fontSize={0.8} onClick={onSave} />
				</div>
			</div>
		</section>
	);

}
