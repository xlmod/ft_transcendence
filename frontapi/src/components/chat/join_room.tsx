import { useState } from "react";

import { iaxios } from "../../utils/axios";
import {  } from '../utils/requester';

import { Button } from "../utils/button";
import { Textinput } from "../utils/textinput";

import './join_room.css'

interface IProps {
	close :( update :boolean ) => void,
}

export function JoinRoom ( props :IProps ) {

	const [name, setName] = useState< string >( "" );
	const [password, setPassword] = useState< string >( "" );
	const [nameError, setNameError] = useState< boolean >( false );
	const [passwordError, setPasswordError] = useState< boolean >( false );

	const nameChange = ( event :any ) => {
		let value :string = event.target.value;
		( value === "" || value.length > 10 )
			? setNameError( true )
			: setNameError( false );
		setName( value );
	};

	const passwordChange = ( event :any ) => {
		let value :string = event.target.value;
		( value === "" || value.length > 10 )
			? setPasswordError( true )
			: setPasswordError( false );
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
		<section id="join-room-section">
			<div id="join-room-wall">
			</div>
			<div id="join-room-window">
				<div id="join-room-input">

					<Textinput
						id="join-room-input-name"
						placeholder="Name"
						onChange={nameChange}
						value={name}
						style={{fontSize: '0.8em'}}
						error={nameError}
						tooltiperror="max 10 characters"
					/>

					<Textinput
						id="join-room-input-password"
						placeholder="Password"
						onChange={passwordChange}
						value={password}
						style={{fontSize: '0.8em'}}
						error={passwordError}
						tooltiperror="max 10 characters"
					/>

				</div>
				<div id="join-room-button">
					<Button id="join-room-button-cancel"
						value="cancel" fontSize={0.8} onClick={() => {props.close(false)}} />
					<Button id="join-room-button-save"
						value="join" fontSize={0.8} onClick={onSave} />
				</div>
			</div>
		</section>
	);

}
