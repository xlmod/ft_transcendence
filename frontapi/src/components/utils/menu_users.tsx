import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { iaxios } from '../../utils/axios';
import CSS from 'csstype';

import './menu_users.css';

const FRONT_URL = "http://localhost:3000/";
//const BACK_URL = "http://localhost:3333/relationship/";

export const MenuUsers = ( id :string, isFriend :boolean, isBlocked :boolean ) => {

	const clickFriend = () =>
	{
		iaxios.get( 'relationship/' + ( ( !isFriend ) ? 'add:' : 'remove:' ) + id )
			.catch( () => { } );
//		isFriend = !isFriend;
	}

	const clickBlock = () =>
	{
		iaxios.get( 'relationship/' + ( ( !isBlocked ) ? 'block:' : 'unblock:' ) + id )
			.catch( () => { } );
//		isBlocked = !isBlocked;
	}

	return(
		<div className="menuUsers">
			<nav className="navUsers">
				<NavLink className="navUsersOptions" to={FRONT_URL + "user:" + id}>
					See profile
				</NavLink>
{/*				<NavLink className="navUsersOptions" to={FRONT_URL + "chat:" + id}>
					Send message
				</NavLink> */}
				<button className="navUsersOptions" onClick={ clickFriend }>
					{ ( !isFriend ) ? "Add friend" : "Remove friend" }
				</button>
				<button className="navUsersOptions" onClick={ clickBlock }>
					{ ( !isBlocked ) ? "Block user" : "Unblock user" }
				</button>
			</nav>
		</div>
	);
}
