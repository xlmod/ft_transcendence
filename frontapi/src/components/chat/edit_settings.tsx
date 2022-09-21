import { useState } from "react";

import { iaxios } from "../../utils/axios";
import { IChannel, getChannelsJoined, IUser } from '../utils/requester';

import { Button } from "../utils/button";
import { Textinput } from '../utils/textinput';
import { ToggleSwitch } from '../utils/toggleswitch';
import { EntryMember } from './entry_member';

import { chat_socket } from '../../socket';

import './edit_settings.css'

interface IProps {
	close :( update :boolean ) => void,
	room :IChannel | null,
	members : IUser[],
	me :IUser | undefined,
}

export function EditSettings ( props :IProps ) {

	const [name, setName] = useState< string >( props.room?props.room.name:"" );
	const [priv, setPriv] = useState< boolean >( props.room
		&& ( props.room.state === "private" || props.room.state === "procated" )
		? true : false );
	const [passwordToggle, setPasswordToggle] = useState< boolean >( false );
	const [password, setPassword] = useState< string >( "" );
	const [nameError, setNameError] = useState< boolean >( false );
	const [selectDelete, setSelectDelete] = useState< boolean >( false );

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

	const passwordToggleChange = ( event :any ) => {
		setPasswordToggle( event.target.checked );
	};

	const passwordChange = ( event :any ) => {
		let value :string = event.target.value;
		setPassword( value );
	};

	const onSave = () => {
		if( nameError )
			return ;

		chat_socket.socket.emit( "update-channel", { name: name, private: priv, password: (passwordToggle?password:null) }, ( response :any ) => {
			console.log( response.data );
		} );
		props.close( false );
	};

	const onDelete = () => {
		chat_socket.socket.emit( "delete-channel", { id: props.room?.id }, ( response :any ) => { } );
		props.close( false );
		return ;
	};

	return (
		<section id="edit-settings-section">
			<div id="edit-settings-wall">
			</div>
			<div id="edit-settings-window">
				{ props.room?.owner.id === props.me?.id &&
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

					<div>
					<label id="edit-settings-input-toggle-pass-label">edit password</label>
					<ToggleSwitch
						id="edit-settings-input-toggle-pass"
						checked={passwordToggle}
						onChange={passwordToggleChange}
					/>
					</div>

					{ passwordToggle &&
					<Textinput
						id="edit-settings-input-password"
						placeholder="Password"
						onChange={passwordChange}
						value={password}
						style={{fontSize: '0.8em'}}
						type="password"
					/>
					}					

					<div id="edit-settings-button-save-parent">
						<Button id="edit-settings-button-save"
							value="save" fontSize={0.8} onClick={onSave} />
						{ selectDelete 
						? <div id="really-nah"><Button id="really" value="really?" fontSize={0.8} onClick={onDelete} />
							<Button id="nah" value="nah" fontSize={0.8} onClick={() => { setSelectDelete( false ); } } /></div>
						: <Button id="edit-settings-button-delete"
							value="delete" fontSize={0.8} onClick={() => { setSelectDelete( true ); } } />
						}
					</div>

				</div> }

				<div id="edit-settings-members-parent">
					<h3>members</h3>
					<div id="edit-settings-members">
						{ props.room && props.members.filter( hein => {
							return hein.id !== props.me?.id
								&& hein.id != props.room?.owner.id ; } ).map( member => (
								<EntryMember room={props.room} member={member} me={props.me} />	
						) ) }
					</div>
					<div id="edit-settings-button">
						<Button id="edit-settings-button-cancel"
							value="close" fontSize={0.8} onClick={() => {props.close(false)}} />
					</div>
				</div>
			</div>
		</section>
	);

}
