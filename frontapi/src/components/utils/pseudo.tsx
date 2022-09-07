import React, { useState } from 'react';

import { MenuUsers } from './menu_users';


interface IProps {
	uid :string,
	pseudo :string,
	isFriend :boolean,
	isBlocked :boolean,
	pseudoClassName :string,
	menuClassName :string
}

export function Pseudo( props: IProps )
{
	const [isFocus, setFocus] = useState( false );

	return(
		<div onMouseEnter={ () => { setFocus( true ); } }
			onMouseLeave={ () => { setFocus( false ); } }
			className={ props.pseudoClassName }>
			{ props.pseudo }
			{ isFocus && <MenuUsers uid={ props.uid } pseudo={ props.pseudo }
				isFriend={ props.isFriend } isBlocked={ props.isBlocked }
				menuClassName={ props.menuClassName } />  }
		</div>
	);
}
