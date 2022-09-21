import React, { useContext, useState, useEffect } from 'react';

import { AuthContext, useAuth } from '../../services/auth.service';
import { IUser, getFriends, getBlocked, getUser } from './requester';
import { MenuUsers } from './menu_users';
import {game_socket} from '../../socket';

import '../../globals.css';


interface IProps {
	pseudo :string,
	isDeleted :boolean,
	pseudoClassName :string,
	menuClassName :string
}


export function Pseudo( props: IProps )
{
	const {checkLogin} = useAuth();
	const [isFocus, setFocus] = useState( false );
	const [status, setStatus] = useState<string>("");

	
	const rnd = new Uint8Array(18);
	window.crypto.getRandomValues(rnd);
	const pseudoUUID = rnd.join("");

	useEffect(() => {
		game_socket.socket.on(`update_${pseudoUUID}`, async () => {
			if (props.isDeleted)
				return ;
			const uid_user = await getUser(props.pseudo);
			const _status = game_socket.status.get(uid_user.id);
			if (_status)
				setStatus(_status);
			else
				setStatus("disconnected");
		});

		game_socket.socket.emit("get_update_status", {uuid: pseudoUUID});

		return () => {
			game_socket.socket.emit("remove_update_status", {uuid: pseudoUUID});
			game_socket.socket.off(`update_${pseudoUUID}`);
		};
	}, []);


	useEffect( () => {
		checkLogin()
	}, [isFocus] );

	return(
		<div onMouseEnter={ () => { setFocus( true ); } }
			onMouseLeave={ () => { setFocus( false ); } }
			className={ `pseudos ${props.pseudoClassName}` }>
			{ status === "online" && <span className="status online">&bull;</span> }
			{ status === "ingame" && <span className="status playing">&bull;</span> }
			{ status === "observer" && <span className="status observing">&bull;</span> }
			{ status === "disconnected" && <span className="status disconnected">&bull;</span> }
			<span className="">{ props.pseudo }</span>
			{ isFocus && !props.isDeleted && <MenuUsers pseudo={ props.pseudo }
				menuClassName={ props.menuClassName } />  }
		</div>
	);
}
