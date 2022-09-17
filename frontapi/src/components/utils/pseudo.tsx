import React, { useContext, useState, useEffect } from 'react';

import { AuthContext } from '../../services/auth.service';
import { IUser, getFriends, getBlocked } from './requester';
import { MenuUsers } from './menu_users';


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

	const waitFriends = async () => {
		const _friends :IUser[] = await getFriends();
		setFriends( _friends );
	};

	const waitBlocked = async () => {
		const _blocked :IUser[] = await getBlocked();
		setBlocked( _blocked );
	};

	useEffect( () => {
		checkLogin()
		waitFriends();
		waitBlocked();
	}, [isFocus] );

	return(
		<div onMouseEnter={ () => { setFocus( true ); } }
			onMouseLeave={ () => { setFocus( false ); } }
			className={ props.pseudoClassName }>
			{ props.pseudo }
			{ isFocus && !props.isDeleted && <MenuUsers pseudo={ props.pseudo }
				isFriend={ friends.find( user => user.pseudo === props.pseudo ) ? true : false }
				isBlocked={ blocked.find( user => user.pseudo === props.pseudo ) ? true : false }
				menuClassName={ props.menuClassName } />  }
		</div>
	);
}
