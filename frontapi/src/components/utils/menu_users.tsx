import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { iaxios } from '../../utils/axios';
import CSS from 'csstype';

import { Gameinvite } from '../game/gameinvite';
import './menu_users.css';

const FRONT_URL = "http://localhost:3000/";
//const BACK_URL = "http://localhost:3333/relationship/";

interface IProps {
	uid :string,
	pseudo :string,
	isFriend :boolean,
	isBlocked :boolean,
	menuClassName :string
}

export function MenuUsers( props: IProps )
{
	const clickFriend = () =>
	{
		iaxios.get( 'relationship/'
			+ ( ( !props.isFriend ) ? 'add:' : 'remove:' ) + props.uid )
			.catch( () => { } );
		props.isFriend = !props.isFriend;
	}

	const clickBlock = () =>
	{
		iaxios.get( 'relationship/'
			+ ( ( !props.isBlocked ) ? 'block:' : 'unblock:' ) + props.uid )
			.catch( () => { } );
		props.isBlocked = !props.isBlocked;
	}

	const [invite, setInvite] = useState( false );

	return(
		<div className={ `menu-users ${props.menuClassName}` }>
			<nav>
				<NavLink
					className="nav-users"
					to={FRONT_URL + "user:" + props.uid}>
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
					onClick={ clickFriend }>
					{ ( !props.isFriend ) ? "Add friend" : "Remove friend" }
				</button>
				<button
					className="nav-users"
					onClick={ clickBlock }>
					{ ( !props.isBlocked ) ? "Block user" : "Unblock user" }
				</button>
				{ invite && <Gameinvite close={ () => { setInvite( false ); } } /> }
			</nav>
		</div>
	);
}
