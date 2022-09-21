import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { IUser, getUser, putFriend, patchBlock, getFriends, getBlocked } from '../utils/requester';
import { Gameinvite } from '../game/gameinvite';
import './menu_users.css';
import { chat_socket } from '../../socket';


interface IProps {
	pseudo :string,
	menuClassName :string
}

export function MenuUsers( props: IProps )
{
	const [invite, setInvite] = useState< boolean >( false );

	const [me, setMe] = useState< IUser | null >( null );
	const [_isFriend, setFriend] = useState< boolean >( false );
	const [_isBlocked, setBlocked] = useState< boolean >( false );
	const [editFriend, setEditFriend] = useState< boolean >( false );
	const [editBlock, setEditBlock] = useState< boolean >( false );

	const navigate = useNavigate();

	const waitMe = async () => {
		const _me :IUser = await getUser("");
		setMe( _me );
	};

	const waitFriendBlock = async ( _pseudo :string ) => {
		if( editFriend )
		{
			const _success :boolean = await putFriend( _pseudo, ( _isFriend?"del":"add" ) );
			if( _success ) setFriend( !_isFriend );
			setEditFriend( false );
		}
		if( editBlock )
		{
			const _success :boolean = await patchBlock( _pseudo, ( _isBlocked?"unblock":"block" ) );
			if( _success ) setBlocked( !_isBlocked );
			if( _success ) setFriend( false );
			setEditBlock( false );
		}
	};

	const waitFriends = async () => {
		const _friends :IUser[] = await getFriends();
		setFriend(_friends.find(user => user.pseudo === props.pseudo) ? true : false);
	};

	const waitBlocked = async () => {
		const _blocked :IUser[] = await getBlocked();
		setBlocked(_blocked.find(user => user.pseudo === props.pseudo) ? true : false);
	};

	useEffect( () => {
		waitFriends();
		waitBlocked();
	}, [] );

	useEffect( () => {
		waitMe();
		waitFriendBlock( props.pseudo )
	}, [ editFriend, editBlock ] );

	if( me && props.pseudo === me.pseudo )
	{
	return(
		<div className={ `menu-users ${props.menuClassName}` }>
			<nav>
				<NavLink
					className="nav-users"
					to={ "/user/" + props.pseudo }>
					See profile
				</NavLink>
			</nav>
		</div>
	);
	}

	return(
		<div className={ `menu-users ${props.menuClassName}` }>
			<nav>
				<NavLink
					className="nav-users"
					to={ "/user/" + props.pseudo }>
					See profile
				</NavLink>
				<button
					className="nav-users"
					onClick={ () => { chat_socket.socket.emit("create-dm", {name: props.pseudo}, (response: any) => {if (!response.err) {chat_socket.socket.emit("autoload-room", {dm: true, id: response.channel_id}) ; navigate("/chat")}}) } }>
					Send message
				</button>
				<button
					className="nav-users"
					onClick={ () => { setInvite( true ); } }>
					Invite to play
				</button>
				<button
					className="nav-users"
					onClick={ () => { setEditFriend( true ); } }>
					{ !_isFriend ? "Add friend" : "Remove friend" }
				</button>
				<button
					className="nav-users"
					onClick={ () => { setEditBlock( true ); } }>
					{ !_isBlocked ? "Block user" : "Unblock user" }
				</button>
				{ invite && <Gameinvite pseudo={props.pseudo} close={ () => { setInvite( false ); } } /> }
			</nav>
		</div>
	);
}
