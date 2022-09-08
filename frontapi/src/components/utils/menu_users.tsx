import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { iaxios } from '../../utils/axios';
import CSS from 'csstype';

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
	const [_isFriend, setFriend] = useState( props.isFriend );
	const [_isBlocked, setBlocked] = useState( props.isBlocked );

	const clickFriend = () =>
	{
		iaxios({
			method: 'put',
			url: 'relationship/' + ( !_isFriend ? 'add' : 'del' ),
			data: { pseudo: props.pseudo },
		})
		.then( data => { setFriend( !_isFriend ) } )
		.catch( () => { } );
	}

	const clickBlock = () =>
	{
		iaxios({
			method: 'patch',
			url: 'relationship/' + ( !_isBlocked ? 'block' : 'unblock' ),
			data: { pseudo: props.pseudo },
		})
		.then( data => {
			setBlocked( !_isBlocked );
			if( _isBlocked ) setFriend( false );
		} )
		.catch( () => { } );
	}

	const [invite, setInvite] = useState( false );

	return(
		<div className={ `menu-users ${props.menuClassName}` }>
			<nav>
				<NavLink
					className="nav-users"
					to={ FRONT_URL + "user/" + props.pseudo }>
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
					{ !_isFriend ? "Add friend" : "Remove friend" }
				</button>
				<button
					className="nav-users"
					onClick={ clickBlock }>
					{ !_isBlocked ? "Block user" : "Unblock user" }
				</button>
				{ invite && <Gameinvite close={ () => { setInvite( false ); } } /> }
			</nav>
		</div>
	);
}
