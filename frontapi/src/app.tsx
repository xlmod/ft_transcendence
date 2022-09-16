import React, {useEffect, useState} from 'react';
import { AuthContext } from './services/auth.service';
import { Signin } from './components/signin/signin';
import { Game } from './components/game/game';
import { Leaderboard } from './components/leaderboard/leaderboard';
import { Chat } from './components/chat/chat';
import { User } from './components/user/user';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/header/header';
import { Navbar } from './components/navbar/navbar';
import {game_socket} from './socket';
import {Gameinvitation} from './components/game/gameinvitation';

import { TFA } from './components/tfa/tfa';

import { iaxios } from './utils/axios';

function App() {
	const [userData, setUserData] = useState<{}>({});
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

	const checkLogin = async () => {
		await iaxios.get("user/me")
			.then((response) => {
				if (!isLoggedIn)
				{
					setUserData(response.data);
					setIsLoggedIn(true);
				}
				return true;
			})
			.catch(() => {
				if (isLoggedIn)
				{
					setUserData({});
					setIsLoggedIn(false);
				}
				return false;
			});
	};
	const logout = async () => {
		await iaxios.get("auth/logout");
		setUserData({});
		setIsLoggedIn(false);
		game_socket.socket.disconnect();
	}

	const [pseudo, setPseudo] = useState<string>("");
	const [obj, setObj] = useState<{}>({});
	const [code, setCode] = useState<string>("");

	const location = useLocation();

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
		if (code !== "")
			setCode(code_l);
		setPseudo("");
	};
	
	if (code != "") {
		this.setState({code: ""});
		if (location.pathname !== "/game")
			return (<Navigate to="/game" />);
	}
	return (
		<AuthContext.Provider value={{userData: userData, isLoggedIn: isLoggedIn, checkLogin: checkLogin, logout: logout}}>
			<Header />
			{!isLoggedIn ? "" : <Navbar />}
			<Routes>
				<Route index element={!isLoggedIn ? <Navigate to="/signin" /> : <Game />} />
				<Route path="signin" element={isLoggedIn ? <Navigate to="/game" /> : <Signin />} />
				<Route path="game" element={!isLoggedIn ? <Navigate to="/signin" /> : <Game />}/>
				<Route path="leaderboard" element={!isLoggedIn ? <Navigate to="/signin" /> : <Leaderboard />} />
				<Route path="chat" element={!isLoggedIn ? <Navigate to="/signin" /> : <Chat />}/>
				<Route path="user" element={!isLoggedIn ? <Navigate to="/signin" /> : <User />}/>
				<Route path="user/:pseudo" element={!isLoggedIn ? <Navigate to="/signin" /> : <User />}/>
				<Route path="tfa" element={ <TFA /> } />
				<Route path="*" element={<section id="navbarText" ><h1>404 Page not found</h1></section>}/>{/* we need to add a 404 route/page */}
			</Routes>
			{pseudo !== "" && <Gameinvitation pseudo={pseudo} obj={obj} close={removeInvite} />}
		</AuthContext.Provider>
	);
}

export default App;
