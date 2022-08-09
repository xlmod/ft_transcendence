import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Header } from './header/header';
import { Signin } from './signin/signin';
import { Game } from './game/game';

export default function Main() {
	return(
		<BrowserRouter>
			<Routes>
				<Route path="/" element={ <Signin /> }>
					<Route path="signin" element={ <Signin /> } />
					<Route path="game" element={ <Game /> } />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

/*<Route path="*" element={ <Error404 /> } />*/

const root = ReactDOM.createRoot( document.getElementById( "root" )! );
root.render( <Main /> );
