import React, { useEffect, useState } from 'react';
import { RequireAuth } from './services/auth.service';
import { Signin } from './components/signin/signin';
import { Game } from './components/game/game';
import { Leaderboard } from './components/leaderboard/leaderboard';
import { Chat } from './components/chat/chat';
import { User } from './components/user/user';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/header/header';
import { Navbar } from './components/navbar/navbar';
import { TFA } from './components/tfa/tfa';

import { Gameinvitation } from './components/game/gameinvitation';
import { game_socket } from './socket';

function App (){
	const [pseudo, setPseudo] = useState<string>("");
	const [obj, setObj] = useState<{}>({});
	const [code, setCode] = useState<string>("");

	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		game_socket.socket.on("invitation", (pseudo_l, obj_l) => { 
			setPseudo(pseudo_l);
			setObj(obj_l);
		});

		return () => {
			game_socket.socket.off("invitation");
		}

	}, []);

	const removeInvite = (code_l: string) => {
		if (code === "")
			setCode(code_l);
		setPseudo("");
	};
	
	if (code !== "") {
		setCode("");
		if (location.pathname !== "/game")
			navigate("/game");
	}

		return (
			<div className='App'>
				<Header />
				<Navbar />
				<Routes>
					<Route index element={<RequireAuth cmp={<Game />}/>} />
					<Route path="signin" element={<Signin />} />
					<Route path="game" element={<RequireAuth cmp={<Game />}/>}/>
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
