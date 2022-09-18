import { useState } from "react";

import { iaxios } from "../../utils/axios";
import {  } from '../utils/requester';

import { Button } from "../utils/button";
import { Textinput } from "../utils/textinput";
import { ToggleSwitch } from "../utils/toggleswitch";

import './new_room.css'

interface IProps {
	close :( update :boolean ) => void,
}

export function NewRoom ( props :IProps ) {

	const [name, setName] = useState< string >( "" );
	const [priv, setPriv] = useState< boolean >( false );
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

	const onSave = async () => {
		if ( nameError )
		{
			return ;
		}
		props.close( false );
	};

	return (
		<section id="new-room-section">
			<div id="new-room-wall">
			</div>
			<div id="new-room-window">
				<div id="new-room-input">

					<Textinput
						id="new-room-input-name"
						placeholder="Name"
						onChange={nameChange}
						value={name}
						style={{fontSize: '0.8em'}}
						error={nameError}
						tooltiperror="max 15 characters"
					/>

					<div>
					<label id="new-room-input-toggle-label">public</label>
					<ToggleSwitch
						id="new-room-input-toggle"
						checked={priv}
						onChange={privChange}
						
					/>
					</div>

					<Textinput
						id="new-room-input-password"
						placeholder="Password"
						onChange={passwordChange}
						value={password}
						style={{fontSize: '0.8em'}}
						type="password"
					/>

				</div>
				<div id="new-room-button">
					<Button id="new-room-button-cancel"
						value="cancel" fontSize={0.8} onClick={() => {props.close(false)}} />
					<Button id="new-room-button-save"
						value="create" fontSize={0.8} onClick={onSave} />
				</div>
			</div>
		</section>
	);

}
