import React from 'react';
import { AuthContext } from './services/auth.service';
import { Signin } from './components/signin/signin';
import { Game } from './components/game/game';
import { Leaderboard } from './components/leaderboard/leaderboard';
import { Chat } from './components/chat/chat';
import { User } from './components/user/user';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Header } from './components/header/header';
import { Navbar } from './components/navbar/navbar';

import { TFA } from './components/tfa/tfa';

function App() {

	return (
		<main>
			<Header />
			<Navbar />
			<Routes>
				<Route index element={<Navigate to="user" />} />
				<Route path="signin" element={<Signin />} />
				<Route path="game" element={<Game />}/>
				<Route path="leaderboard" element={ <Leaderboard />} />
				<Route path="chat" element={ <Chat />}/>
				<Route path="user"element={ <User />}/>
				<Route path="*" element={<section id="navbarText" ><h1>404 Page not found</h1></section>}/>{/* we need to add a 404 route/page */}
			</Routes>
		</main>
	);
}

export default App;
