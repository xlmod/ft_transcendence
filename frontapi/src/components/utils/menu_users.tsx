import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { iaxios } from '../../utils/axios';
import CSS from 'csstype';

import { IUser, getMe, putFriend, patchBlock } from '../utils/requester';
import { Gameinvite } from '../game/gameinvite';
import './menu_users.css';

const FRONT_URL = "http://localhost:3000/";
//const BACK_URL = "http://localhost:3333/relationship/";

interface IProps {
	pseudo :string,
	isFriend :boolean,
	isBlocked :boolean,
	menuClassName :string
}

export function MenuUsers( props: IProps )
{
	const [invite, setInvite] = useState< boolean >( false );

	const [me, setMe] = useState< IUser | null >( null );
	const [_isFriend, setFriend] = useState< boolean >( props.isFriend );
	const [_isBlocked, setBlocked] = useState< boolean >( props.isBlocked );
	const [editFriend, setEditFriend] = useState< boolean >( false );
	const [editBlock, setEditBlock] = useState< boolean >( false );

	const waitMe = async () => {
		const _me :IUser = await getMe();
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
					onClick={ () => { setInvite( true ); } }>
					Invite to play
				</button>
{/*
				<NavLink
					className="nav-users"
					to={FRONT_URL + "chat:" + id}>
					Send message
				</NavLink>
*/}
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
