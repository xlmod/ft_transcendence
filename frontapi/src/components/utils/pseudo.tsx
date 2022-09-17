import React, { useContext, useState, useEffect } from 'react';

import { AuthContext } from '../../services/auth.service';
import { IUser, getFriends, getBlocked, getUser } from './requester';
import { MenuUsers } from './menu_users';
import {game_socket} from '../../socket';


interface IProps {
	pseudo :string,
	isDeleted :boolean,
	pseudoClassName :string,
	menuClassName :string
}


export function Pseudo( props: IProps )
{
	const {checkLogin} = useContext( AuthContext );

	const [friends, setFriends] = useState< IUser[] >([]);
	const [blocked, setBlocked] = useState< IUser[] >([]);
	const [isFocus, setFocus] = useState( false );
	const [uid, setUid] = useState<string>("");
	const [status, setStatus] = useState<string>("");

	const waitFriends = async () => {
		const _friends :IUser[] = await getFriends();
		setFriends( _friends );
	};

	const waitBlocked = async () => {
		const _blocked :IUser[] = await getBlocked();
		setBlocked( _blocked );
	};

	useEffect(() => {
		game_socket.socket.on("update_userstatus_reload", async () => {
			console.log(`STATUS ${props.pseudo} -> ${uid}`);
			const uid_user = await getUser(props.pseudo);
			const _status = game_socket.status.get(uid_user.id);
			if (_status)
				setStatus(_status);
			else
				setStatus("disconnected");
		});

		game_socket.socket.emit("get_update_status");

		return () => {
			game_socket.socket.off("update_userstatus_reload");
		};
	}, []);


	useEffect( () => {
		checkLogin()
		waitFriends();
		waitBlocked();
	}, [isFocus] );

	return(
		<div onMouseEnter={ () => { setFocus( true ); } }
			onMouseLeave={ () => { setFocus( false ); } }
			className={ props.pseudoClassName }>
			{ status === "online" && "* " }
			{ status === "ingame" && "G " }
			{ status === "observer" && "O " }
			{ props.pseudo }
			{ isFocus && !props.isDeleted && <MenuUsers pseudo={ props.pseudo }
				isFriend={ friends.find( user => user.pseudo === props.pseudo ) ? true : false }
				isBlocked={ blocked.find( user => user.pseudo === props.pseudo ) ? true : false }
				menuClassName={ props.menuClassName } />  }
		</div>
	);
}
