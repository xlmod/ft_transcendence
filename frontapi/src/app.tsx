import React from 'react';
import { RequireAuth } from './services/auth.service';
import { Signin } from './components/signin/signin';
import { Game } from './components/game/game';
import { Leaderboard } from './components/leaderboard/leaderboard';
import { Chat } from './components/chat/chat';
import { User } from './components/user/user';
<<<<<<< HEAD
import { Routes, Route } from 'react-router-dom';
=======
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
>>>>>>> origin/develop
import { Header } from './components/header/header';
import { Navbar } from './components/navbar/navbar';
import { TFA } from './components/tfa/tfa';

import { Gameinvitation } from './components/game/gameinvitation';

function App (){

		const {pseudo, obj, removeInvite} = useAuth();
		return (
			<div className='App'>
				<Header />
				<Navbar />
				<Routes>
					<Route index element={<RequireAuth cmp={<Game />}/>} />
					<Route path="signin" element={<Signin />} />
					<Route path="game" element={<RequireAuth cmp={<Game />}/>}/>
					<Route path="game/:code" element={<RequireAuth cmp={<Game invitation={true} />}/>}/>
					<Route path="leaderboard" element={<RequireAuth cmp={<Leaderboard />}/>} />
					<Route path="chat" element={<RequireAuth cmp={<Chat />}/>}/>
					<Route path="user" element={<RequireAuth cmp={<User />}/>}/>
					<Route path="user/:pseudo" element={<RequireAuth cmp={<User />}/>}/>
					<Route path="tfa" element={<TFA />}/>
					<Route path="*" element={<section id="navbarText" ><h1>404 Page not found</h1></section>}/>{/* we need to add a 404 route/page */}
				</Routes>
				{pseudo !== "" && <Gameinvitation pseudo={pseudo} obj={obj} close={removeInvite} />}
			</div>
		);
}

export default App;