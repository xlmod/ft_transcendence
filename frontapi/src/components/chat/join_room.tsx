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
	const [nameFocus, setNameFocus] = useState< boolean >( false )
	const [nameError, setNameError] = useState< boolean >( false );
	const [guessFocus, setGuessFocus] = useState< boolean >( false );
	const [password, setPassword] = useState< string >( "" );
	const [passwordError, setPasswordError] = useState< boolean >( false );
	const [rooms, setRooms] = useState< string[] >( [ "a", "ab", "abc", "abcd", "abcde", "abcdef" ] );

	const nameChange = ( event :any ) => {
		let value :string = event.target.value;
/*
		( value === "" || value.length > 10 )
			? setNameError( true )
			: setNameError( false );
*/
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
						onFocus={ () => { setNameFocus( true ) } }
						onBlur={ () => { setNameFocus( false ) } }
						value={name}
						style={{fontSize: '0.8em'}}
						error={nameError}
						tooltiperror="max 10 characters"
					/>

					{ ( nameFocus || guessFocus ) &&
						<div id="guess"
							onMouseEnter={ () => { setGuessFocus( true ) } }
							onMouseLeave={ () => { setGuessFocus( false ) } }>
							{ rooms.map( room => (
								name === room.substr( 0, name.length ) && name !== room
									? <div
										onClick={ () => { setName( room ); setGuessFocus( false ); } }>
										{room}
									</div> : ""
							) ) }
						</div>
					}

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
