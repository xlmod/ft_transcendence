import { useState, useEffect } from "react";

import { iaxios } from "../../utils/axios";
import { getChannelsNamesStates } from '../utils/requester';

import { Button } from "../utils/button";
import { Textinput } from "../utils/textinput";
import { chat_socket } from "../../socket";

import './join_room.css'

interface IProps {
	close :( update :boolean ) => void,
}

export function JoinRoom ( props :IProps ) {

	const [name, setName] = useState< string >( "" );
	const [nameFocus, setNameFocus] = useState< boolean >( false )
	const [nameError, setNameError] = useState< boolean >( false );
	const [errString, setErrString] = useState< string >( "" );
	const [guessFocus, setGuessFocus] = useState< boolean >( false );
	const [password, setPassword] = useState< string >( "" );
	const [passwordError, setPasswordError] = useState< boolean >( false );
	const [rooms, setRooms] = useState< string[] >( [] );

	const nameChange = ( event :any ) => {
		let value :string = event.target.value;
		( value === "" || value.length > 15 )
			? setNameError( true )
			: setNameError( false );
		setName( value );
	};

	const passwordChange = ( event :any ) => {
		let value :string = event.target.value;
		setPassword( value );
	};

	const onSave = async () => {
		if ( nameError )
			return ;
		chat_socket.socket.emit(
			"join-room",
			{name: name, password: password},
			(data: any) => {
				if (data.err) {
					setNameError(true);
					setErrString(data.data);
				} else {
					props.close( false );
				}
			console.log(data);
			}
		);
		props.close( false );
	};

	const waitRooms = async () => {
		const arrayChannelsNames: {name: string, state: string}[] = await getChannelsNamesStates();
		setRooms(arrayChannelsNames.map(elem => elem.name));
	};

	useEffect(() => {
		waitRooms(); 
	}, []);

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
						tooltiperror="max 15 characters"
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
						tooltiperror="erroneous password"
						type="password"
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
