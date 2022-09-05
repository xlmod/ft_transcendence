import React from 'react';
import { NavLink } from 'react-router-dom';

import './header.css';

export function Header()
:  JSX.Element
{
	return (
		<header>
			<NavLink id="logo" to="/">
				<div id="P">P</div>
				<div id="O">O</div>
				<div id="N">N</div>
				<div id="G">G</div>
				<div id="under">_</div>
			</NavLink>
		</header>
	);
}
