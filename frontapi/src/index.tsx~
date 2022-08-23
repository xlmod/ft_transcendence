import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Signin } from './signin/signin';
import { Game } from './game/game';

/*
TODO


*/

class Main extends React.Component {
	render()
	{
		return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={ <Signin /> } />
				<Route path="signin" element={ <Signin /> } />
				<Route path="game" element={ <Game /> } />
			</Routes>
		</BrowserRouter>
		);
	}
}

/*<Route path="*" element={ <Error404 /> } />*/

const root = ReactDOM.createRoot( document.getElementById( "root" )! );
root.render( <Main /> );
