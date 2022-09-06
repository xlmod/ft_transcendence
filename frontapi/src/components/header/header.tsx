import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import './header.css';

export function Header()
:  JSX.Element
{
	const pathname = useLocation().pathname;
	const path = ( pathname !== "/signin" && pathname !== "/tfa" ) ? "/" : pathname;

	return (
		<header>
			<NavLink id="logo" to={path}>
				<div id="P">P</div>
				<div id="O">O</div>
				<div id="N">N</div>
				<div id="G">G</div>
				<div id="under">_</div>
			</NavLink>
		</header>
	);
}
