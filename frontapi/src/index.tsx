import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Signin } from './signin/signin';
import { Game } from './game/game';
import { Leaderboard } from './leaderboard/leaderboard';
import { Chat } from './chat/chat';
import { User } from './user/user';
import { amIAuthorized } from './middleware';

/*
TODO


*/

class Main extends React.Component {
	render()
	{
		return (
			<BrowserRouter>
				<Routes>
					<Route path="/" element={ <Game /> } />
					<Route path="signin" element={ <Signin /> } />
					<Route path="game" element={ <Game /> } />
					<Route path="leaderboard" element={ <Leaderboard /> } />
					<Route path="chat" element={ <Chat /> } />
					<Route path="user"element={ <User /> } />
				</Routes>
			</BrowserRouter>
		);

/*
		return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={
					amIAuthorized()
					? ( <Navigate replace to="/game" /> )
					: ( <Navigate replace to="/signin" /> ) } />
				<Route path="signin" element={
					amIAuthorized()
					? ( <Navigate replace to="/game" /> ) 
					: ( <Signin /> ) } />
				<Route path="game" element={
					amIAuthorized()
					? ( <Game /> )
					: ( <Navigate replace to="/signin" /> ) } />
				<Route path="leaderboard" element={
					amIAuthorized()
					? ( <Leaderboard /> )
					: ( <Navigate replace to="/signin" /> ) } />
				<Route path="chat" element={
					amIAuthorized()
					? ( <Chat /> )
					: ( <Navigate replace to="/signin" /> ) } />
				<Route path="user" element={
					amIAuthorized()
					? ( <User /> )
					: ( <Navigate replace to="/signin" /> ) } />
			</Routes>
		</BrowserRouter>
		);
*/
	}
}

/*<Route path="*" element={ <Error404 /> } />*/

const root = ReactDOM.createRoot( document.getElementById( "root" )! );
root.render( <Main /> );
