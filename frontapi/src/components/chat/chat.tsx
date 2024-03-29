import React, { useEffect, useState, useRef } from 'react';

import { useAuth } from '../../services/auth.service';
import { IUser, IChannel, getAllUsers, getFriends, getChannelsJoined , getUser} from '../utils/requester';
import { game_socket } from '../../socket';

import { Message } from './message';
import { Pseudo } from '../utils/pseudo';
import { Button } from '../utils/button';
import { NewRoom } from './new_room';
import { JoinRoom } from './join_room';
import { EditSettings } from './edit_settings';

import './chat.css';
import {chat_socket} from '../../socket';

export function Chat()
: JSX.Element
{
	const {checkLogin} = useAuth();
	const [actualRoom, setActualRoom] = useState< IChannel | null >( null );
	const [joinedRooms, setJoinedRooms] = useState< IChannel[] >([]);
	const [connectedUsers, setConnectedUsers] = useState< string[] >([]);
	const [msglist, setMsglist] = useState< [ JSX.Element | null ] >( [ null ] );
	const [friends, setFriends] = useState< IUser[] | null >([]);
	const [selectFriends, setSelectFriends] = useState< boolean >( false );
	const [update,updateState] = useState<{}>();
	const [newRoom, setNewRoom] = useState< boolean >( false );
	const [joinRoom, setJoinRoom] = useState< boolean >( false );
	const [editSettings, setEditSettings] = useState< boolean >( false );
	const [me, setMe] = useState<IUser>();
	const [members, setMembers] = useState< IUser[] >([]);
	const [autoload, setAutoload] = useState<number>(-1);
	const [roomName, setRoomName] = useState< string|undefined >( "" );

	let inRef = useRef<HTMLInputElement | null>(null);
	let msgRef = useRef<HTMLDivElement | null>(null);

	const rnd = new Uint8Array(18);
	window.crypto.getRandomValues(rnd);
	const pseudoUUID = rnd.join("");

	const inputChange = (event: any) => {
		let value: string = event.target.value;
		if (value.length > 255)
			event.target.value = value.slice(0, 256);
	};

	const addMessage = ( event :React.FormEvent<HTMLFormElement> ) => {
		event.preventDefault();
		const d = new Date();
		let input :HTMLInputElement | null = inRef.current;
		if ( input )
		{
			let value = input.value;
			if( value.trimStart() === "" )
				return ;
			input.value = "";
			if (actualRoom) {
				chat_socket.socket.emit("send-message", {id: actualRoom.id, msg: value});
			}
		}
	}

	const waitFriends = async () => {
		const arrayFriends :IUser[] = await getFriends();
		setFriends( arrayFriends );
	};

	const waitChannelsJoined = async () => {
		const arrayChannels :IChannel[] = await getChannelsJoined();
		setJoinedRooms( arrayChannels );
	};

	const quitChannel = async () => {
		chat_socket.socket.emit("leave-room", {id: actualRoom?.id});
		setActualRoom( null );
		setMsglist([null]);
	};

	const deleteDM = async () => {
		chat_socket.socket.emit("quit-dm", {id: actualRoom?.id});
		setActualRoom( null );
		setMsglist([null]);
	};

	const reloadMsg = async (room: IChannel) => {
		chat_socket.socket.emit("get-msg", {id: room.id}, (response: any) => {
			if (response.err)
				return ;
			let lstmsg: [JSX.Element | null] = [null];
			response.msg.reverse().forEach((elem: any) => {
				const d = new Date(elem.date);
				let msg = <Message date={d.toLocaleTimeString()} owner={me?.id === elem.user.id ? "Me" : elem.user.pseudo} me={me?.id === elem.user.id} body={elem.message} /> ;
				lstmsg.push(msg);
			});
			setMsglist(lstmsg);
			updateState({});
		});
	};

	const reloadMembers = async (room: IChannel) => {
		chat_socket.socket.emit("get-members", {id: room.id}, (response: any) => {
			if (response.err)
				return ;
			setMembers(response.members);
			updateState({});
		});

	};

	const changeRoom = async (room: IChannel) => {
		if( room.state === "dm" )
			setRoomName (room.members.find(member => member.pseudo !== me?.pseudo)?.pseudo);
		room.members = members;
		setActualRoom(room);
		await reloadMsg(room);
		await reloadMembers(room);
		updateState({});
	};

	const getMyUser = async () => {
		setMe(await getUser(""));
	};

	useEffect( () => {
		chat_socket.socket.off("update_msg_list");
		chat_socket.socket.on("update_msg_list", (channel) => {
			console.log(actualRoom);
			if (channel.id === actualRoom?.id) {
				if (actualRoom)
					reloadMsg(actualRoom);
			}
		});
		chat_socket.socket.off("update_members_list");
		chat_socket.socket.on("update_members_list", () => {
			if (actualRoom)
				reloadMembers(actualRoom);
		});
		setRoomName( actualRoom
						? ( actualRoom.state === "dm"
							? roomName
							: actualRoom.name )
						: "welcome" );
	}, [actualRoom] );

	useEffect( () => {
		checkLogin();
		let msgdiv: HTMLDivElement | null = msgRef.current;
		if (msgdiv) {
			msgdiv.scrollTop = msgdiv.scrollHeight;
		}

		waitFriends();
		waitChannelsJoined();
	}, [update] );

	useEffect(() => {
		if (autoload != -1) {
			joinedRooms.forEach((channel) => {
				if (channel.id === autoload) {
					changeRoom(channel);
					setAutoload(-1);
				}
			});
		}
	}, [joinedRooms]);

	useEffect( () => {

		chat_socket.socket.on("autoload_room", (roomid: number) => {
			setAutoload(roomid);
			updateState({});
		});
		
		chat_socket.socket.on("update_room_list", () => {
			waitChannelsJoined();
		});

		game_socket.socket.on(`update_${pseudoUUID}`, async () => {
			const allUsers = await getAllUsers();
			let _arrayConnected :string[] = [];
			let _connected :IUser;
			game_socket.status.forEach( (status, id) => {
				_connected = allUsers.filter( one => {
					return one.id === id; } )[0];
				if( _connected ) _arrayConnected.push( _connected.pseudo );
			} );
			setConnectedUsers( _arrayConnected );
		} );

		game_socket.socket.emit("get_update_status", {uuid: pseudoUUID});
		getMyUser();

		return () => {
			game_socket.socket.emit("remove_update_status", {uuid: pseudoUUID});
			game_socket.socket.off(`update_${pseudoUUID}`);
			chat_socket.socket.off("update_room_list");
			chat_socket.socket.off("autoload_room");
		};
	}, [] );

		return (
			<main>
				<section id="chat-section">
					{ newRoom && <NewRoom close={setNewRoom} /> }
					{ joinRoom && <JoinRoom close={setJoinRoom} /> }
					<div id="chat-rooms">
						<div id="chat-joined-rooms" className="chat-block">
							<div className="chat-title">Rooms</div>
							<div id="rooms-controls">
								<Button id="new-room" value="new"
										fontSize={0.6} onClick={ () => {setNewRoom( true ); } } />
								<Button id="join-room" value="join"
										fontSize={0.6} onClick={ () => {setJoinRoom( true ); } } />
							</div>
							<ul className="chat-list">
								{ joinedRooms.filter( hein => {
									return hein.state !== "dm" } ).map( room => (
										<li onClick={() => {changeRoom(room)} }>{room.name}</li>
								) ) }
							</ul>
						</div>
						<div id="chat-private-rooms" className="chat-block">
							<div className="chat-title">PRIVMSG</div>
							<ul className="chat-list">
								{ joinedRooms.filter( hein => {
									return hein.state === "dm" } ).map( room => (
										<li onClick={() => {changeRoom(room)} }>{room.members.find(member => member.pseudo !== me?.pseudo)?.pseudo}</li>
								) ) }
							</ul>
						</div>
					</div>
					<div id="chat-content">
						<div id="chat-header">
						{ actualRoom && actualRoom?.state !== "dm" && <Button id="quit" value="quit" fontSize={0.6}
								onClick={quitChannel} /> }
						{ actualRoom && actualRoom?.state === "dm" && <Button id="quit" value="delete" fontSize={0.6}
						onClick={deleteDM} /> }
							<div id="chat-name">
								{ roomName }
							</div>
							{ me && actualRoom && actualRoom.state !== "dm"
						&& ( actualRoom.owner.id === me.id
							|| actualRoom.admin.find( admin => admin === me.id ) )
						&& <div id="iconSettings" onClick={ () => { setEditSettings( true ); } }> 
<svg version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 54 54">
<g>
<path d="M51.22,21h-5.052c-0.812,0-1.481-0.447-1.792-1.197s-0.153-1.54,0.42-2.114l3.572-3.571
        c0.525-0.525,0.814-1.224,0.814-1.966c0-0.743-0.289-1.441-0.814-1.967l-4.553-4.553c-1.05-1.05-2.881-1.052-3.933,0l-3.571,3.571
        c-0.574,0.573-1.366,0.733-2.114,0.421C33.447,9.313,33,8.644,33,7.832V2.78C33,1.247,31.753,0,30.22,0H23.78
        C22.247,0,21,1.247,21,2.78v5.052c0,0.812-0.447,1.481-1.197,1.792c-0.748,0.313-1.54,0.152-2.114-0.421l-3.571-3.571
        c-1.052-1.052-2.883-1.05-3.933,0l-4.553,4.553c-0.525,0.525-0.814,1.224-0.814,1.967c0,0.742,0.289,1.44,0.814,1.966l3.572,3.571
        c0.573,0.574,0.73,1.364,0.42,2.114S8.644,21,7.832,21H2.78C1.247,21,0,22.247,0,23.78v6.439C0,31.753,1.247,33,2.78,33h5.052
        c0.812,0,1.481,0.447,1.792,1.197s0.153,1.54-0.42,2.114l-3.572,3.571c-0.525,0.525-0.814,1.224-0.814,1.966
        c0,0.743,0.289,1.441,0.814,1.967l4.553,4.553c1.051,1.051,2.881,1.053,3.933,0l3.571-3.572c0.574-0.573,1.363-0.731,2.114-0.42
        c0.75,0.311,1.197,0.98,1.197,1.792v5.052c0,1.533,1.247,2.78,2.78,2.78h6.439c1.533,0,2.78-1.247,2.78-2.78v-5.052
        c0-0.812,0.447-1.481,1.197-1.792c0.751-0.312,1.54-0.153,2.114,0.42l3.571,3.572c1.052,1.052,2.883,1.05,3.933,0l4.553-4.553
        c0.525-0.525,0.814-1.224,0.814-1.967c0-0.742-0.289-1.44-0.814-1.966l-3.572-3.571c-0.573-0.574-0.73-1.364-0.42-2.114
        S45.356,33,46.168,33h5.052c1.533,0,2.78-1.247,2.78-2.78V23.78C54,22.247,52.753,21,51.22,21z M52,30.22
        C52,30.65,51.65,31,51.22,31h-5.052c-1.624,0-3.019,0.932-3.64,2.432c-0.622,1.5-0.295,3.146,0.854,4.294l3.572,3.571
        c0.305,0.305,0.305,0.8,0,1.104l-4.553,4.553c-0.304,0.304-0.799,0.306-1.104,0l-3.571-3.572c-1.149-1.149-2.794-1.474-4.294-0.854
        c-1.5,0.621-2.432,2.016-2.432,3.64v5.052C31,51.65,30.65,52,30.22,52H23.78C23.35,52,23,51.65,23,51.22v-5.052
        c0-1.624-0.932-3.019-2.432-3.64c-0.503-0.209-1.021-0.311-1.533-0.311c-1.014,0-1.997,0.4-2.761,1.164l-3.571,3.572
        c-0.306,0.306-0.801,0.304-1.104,0l-4.553-4.553c-0.305-0.305-0.305-0.8,0-1.104l3.572-3.571c1.148-1.148,1.476-2.794,0.854-4.294
        C10.851,31.932,9.456,31,7.832,31H2.78C2.35,31,2,30.65,2,30.22V23.78C2,23.35,2.35,23,2.78,23h5.052
        c1.624,0,3.019-0.932,3.64-2.432c0.622-1.5,0.295-3.146-0.854-4.294l-3.572-3.571c-0.305-0.305-0.305-0.8,0-1.104l4.553-4.553
        c0.304-0.305,0.799-0.305,1.104,0l3.571,3.571c1.147,1.147,2.792,1.476,4.294,0.854C22.068,10.851,23,9.456,23,7.832V2.78
        C23,2.35,23.35,2,23.78,2h6.439C30.65,2,31,2.35,31,2.78v5.052c0,1.624,0.932,3.019,2.432,3.64
        c1.502,0.622,3.146,0.294,4.294-0.854l3.571-3.571c0.306-0.305,0.801-0.305,1.104,0l4.553,4.553c0.305,0.305,0.305,0.8,0,1.104
        l-3.572,3.571c-1.148,1.148-1.476,2.794-0.854,4.294c0.621,1.5,2.016,2.432,3.64,2.432h5.052C51.65,23,52,23.35,52,23.78V30.22z"/>
    <path d="M27,18c-4.963,0-9,4.037-9,9s4.037,9,9,9s9-4.037,9-9S31.963,18,27,18z M27,34c-3.859,0-7-3.141-7-7s3.141-7,7-7
        s7,3.141,7,7S30.859,34,27,34z"/>
</g>
</svg>
							</div> }
							{ editSettings && <EditSettings close={setEditSettings} room={actualRoom} members={members} me={me} /> }
						</div>
						<div id="chat-messages" ref={ msgRef }>
							{ msglist }
						</div>
						<form id="chat-form" onSubmit={ addMessage }>
							<input id="chat-form-input" type="text" autoComplete='off' name="message" placeholder="Type your message here" ref={ inRef } onChange={inputChange}/>
							<input id="chat-form-submit" type="submit" value="Send"/>
						</form>
					</div>
					<div id="chat-users" className="menu">
						<div id="chat-friends" className="chat-block">
							<div id="users-friends-titles">
								<div className={`chat-title friends-title ${selectFriends?'selected':''}`} onClick={ () => { setSelectFriends( true ); } }>Friends</div>
								<div className={`chat-title users-title ${selectFriends?'':'selected'}`} onClick={ () => { setSelectFriends( false ); } }>Users</div>
							</div>
							<div className="chat-list" onClick={ () => { updateState({}); } } onMouseLeave={() => {updateState({});}}>
								{ selectFriends
									? ( friends ? friends.map( friend => (
										<Pseudo pseudo={ friend.pseudo ? friend.pseudo : "undefined" } isDeleted={false}
											pseudoClassName="friends" menuClassName="menu-friends" />
									)) : "" )
									: ( connectedUsers.map( user => (
										<Pseudo pseudo={user} isDeleted={false}
											pseudoClassName="connected-users"
											menuClassName="menu-users" /> ) ) )
								}
							</div>
						</div>
						<div id="chat-members" className="chat-block">
							<div className="chat-title">Members</div>
							<ul className="chat-list" >
								{ actualRoom &&
									members.map( member => (
										<Pseudo pseudo={ member.pseudo?member.pseudo:"undefined" }
											isDeleted={false}
											pseudoClassName="members" menuClassName="menu-members" />
									) ) }
							</ul>
						</div>
					</div>
				</section>
			</main>
		);
}
