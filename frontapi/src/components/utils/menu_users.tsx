import React, { useState } from 'react';
import axios from 'axios';
import CSS from 'csstype';

import './menu_users.css';

const FRONT_URL = "http://localhost:3000/";
const BACK_URL = "http://localhost:3333/relationship/";

export const MenuUsers = ( id :string, isFriend :boolean, isBlocked :boolean ) => {
	return(
		<div className="menuUsers">
			<nav className="navUsers">
				<NavLink className="navUsersOptions" to={FRONT_URL + "user:" + id}>
					See profile
				</NavLink>
				<NavLink className="navUsersOptions" to={FRONT_URL + "chat:" + id}>
					Send message
				</NavLink>
				<NavLink className="navUsersOptions"
					to={ ( !isFriend ) ? ( BACK_URL + "add:" + id ) : ( BACK_URL + "remove:" + id ) }>
					{ ( !isFriend ) ? "Add friend" : "Remove friend" }
				</NavLink>
				<NavLink className="navUsersOptions"
					to={ (!isBlocked) ? ( BACK_URL + "block:" + id ) : ( BACK_URL + "unblock:" + id ) }>
					{ ( !isBlocked ) ? "Block user" : "Unblock user" }
				</NavLink>
			</nav>
		</div>
	);
}
