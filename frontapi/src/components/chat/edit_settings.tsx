import { useState } from "react";

import { iaxios } from "../../utils/axios";
import { IChannel, getChannelsJoined } from '../utils/requester';

import { Button } from "../utils/button";
import { Textinput } from '../utils/textinput';
import { ToggleSwitch } from '../utils/toggleswitch';

import { chat_socket } from '../../socket';

import './edit_settings.css'

interface IProps {
	close :( update :boolean ) => void,
	room :IChannel | null,
}

export function EditSettings ( props :IProps ) {

	const [name, setName] = useState< string >( props.room?props.room.name:"" );
	const [priv, setPriv] = useState< boolean >( props.room
		&& ( props.room.state === "private" || props.room.state === "procated" )
		? true : false );
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

	const adminChange = ( name? :string, uid? :string, isAdmin? :boolean ) => {
		isAdmin
		? chat_socket.socket.emit( "unset-admin", { name: name, uid: uid }, ( response :any ) => {
			console.log( response.data );
		} )
		: chat_socket.socket.emit( "set-admin", { name: name, uid: uid }, ( response :any ) => {
			console.log( response.data );
		} );
	};

	const banChange = ( name? :string, uid? :string, isBanned? :boolean ) => {
		isBanned
		? chat_socket.socket.emit( "unban-user", { name: name, uid: uid }, ( response :any ) => {
			console.log( response.data );
		} )
		: chat_socket.socket.emit( "ban-user", { name: name, uid: uid }, ( response :any ) => {
			console.log( response.data );
		} );	
	};

	const muteChange = ( name? :string, uid? :string, isMuted? :boolean ) => {
		isMuted
		? chat_socket.socket.emit( "unmute-user", { name: name, uid: uid }, ( response :any ) => {
			console.log( response.data );
		} )
		: chat_socket.socket.emit( "mute-user", { name: name, uid: uid }, ( response :any ) => {
			console.log( response.data );
		} );		
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

					<div id="edit-settings-button-save-parent">
						<Button id="edit-settings-button-save"
							value="save" fontSize={0.8} onClick={onSave} />
					</div>

				</div>

				<div id="edit-settings-members-parent">
					<h3>members</h3>
					<div id="edit-settings-members">
						{ props.room && props.room.members.map( member => (
							<div className="members">
								<div className="pseudo">{ member.pseudo }</div>
								<div className="controls">
									<Button className={`admin ${props.room?.admin.find( admin => (
										admin.pseudo === member.pseudo ) )
											? "selected" : "unselected" }`}
										value="adm" fontSize={0.8}
										onClick={ () => { adminChange( props.room?.name, member.id, ( props.room?.admin.find( admin => (
											admin.pseudo === member.pseudo ) ) )?true:false ) } }/>
									<Button className={`ban ${props.room?.ban.find( ban => (
										ban.pseudo === member.pseudo ) )
											? "selected" : "unselected" }`}
										 value="ban" fontSize={0.8}
										onClick={ () => { banChange( props.room?.name, member.id, ( props.room?.ban.find( ban => (
											ban.pseudo === member.pseudo ) ) )?true:false ) } } />
									<Button className={`mute ${props.room?.mute.find( mute => (
										mute.pseudo === member.pseudo ) )
											? "selected" : "unselected" }`} value="mut" fontSize={0.8}
										onClick={ () => { muteChange( props.room?.name, member.id, ( props.room?.mute.find( mute => (
											mute.pseudo === member.pseudo ) ) )?true:false ) } } />
								</div>
							</div>
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
