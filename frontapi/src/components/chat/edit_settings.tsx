import { useState } from "react";

import { iaxios } from "../../utils/axios";
import {  } from '../utils/requester';

import { Button } from "../utils/button";
import { Textinput } from '../utils/textinput';
import { ToggleSwitch } from '../utils/toggleswitch';

import './edit_settings.css'

interface IProps {
	close :( update :boolean ) => void,
}

export function EditSettings ( props :IProps ) {

	const [name, setName] = useState< string >( "" );
	const [priv, setPriv] = useState< boolean >( true );
	const [password, setPassword] = useState< string >( "" );
	const [nameError, setNameError] = useState< boolean >( false );

	const nameChange = ( event :any ) => {
		let value :string = event.target.value;
		( value === "" || value.length > 15 )
			? setNameError( true )
			: setNameError( false );
		setName( value );
	};

	const privChange = ( event :any ) => {
		setPriv( event.target.checked );
	};

	const passwordChange = ( event :any ) => {
		let value :string = event.target.value;
		setPassword( value );
	};

	const onSave = async() => {
		if( nameError )
			return ;
		props.close( false );
	};

	return (
		<section id="edit-settings-section">
			<div id="edit-settings-wall">
			</div>
			<div id="edit-settings-window">
				<div id="edit-settings-input">

					<Textinput
						id="edit-settings-input-name"
						onChange={nameChange}
						value={name}
						style={{fontSize: '0.8em'}}
						error={nameError}
						tooltiperror="max 15 characters"
					/>

					<div>
					<label id="edit-settings-input-toggle-label">public</label>
					<ToggleSwitch
						id="edit-settings-input-toggle"
						checked={!priv}
						onChange={privChange}
					/>
					</div>

					<Textinput
						id="edit-settings-input-password"
						placeholder="Password"
						onChange={passwordChange}
						value={password}
						style={{fontSize: '0.8em'}}
						type="password"
					/>					

					<div id="eddit-settings-button-save-parent">
						<Button id="edit-settings-button-save"
							value="save" fontSize={0.8} onClick={onSave} />
					</div>

				</div>

				<div id="edit-settings-button">
					<Button id="edit-settings-button-cancel"
						value="close" fontSize={0.8} onClick={() => {props.close(false)}} />
				</div>
			</div>
		</section>
	);

}
