import React from 'react';
import { AuthContext } from './services/auth.service';
import { AuthState } from './services/auth.service';
import { Signin } from './components/signin/signin';
import { Game } from './components/game/game';
import { Leaderboard } from './components/leaderboard/leaderboard';
import { Chat } from './components/chat/chat';
import { User } from './components/user/user';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import axios from "axios";
import { Header } from './components/header/header';
import { Navbar } from './components/navbar/navbar';

const API_URL = "http://localhost:3333/";
class App extends React.Component<{}, {userData: {}, isLoggedIn: boolean, checkLogin:any}> {

	checkLogin = () => {
		
		return axios
			.get(API_URL + "user/me", {withCredentials: true})
			.then((response) => {
				if (!this.state.isLoggedIn)
				{
					this.setState({
						userData: response.data,
						isLoggedIn : true
					});
				}
				return true;
			})
			.catch((err) => {
				if (this.state.isLoggedIn)
				{
					this.setState({
						userData: {},
						isLoggedIn : false
					});
				}
				return false;
			});
	};
	constructor(props)
	{
		super(props);
		this.state = {
			userData : {},
			isLoggedIn : false,
			checkLogin : this.checkLogin
		}
	};
	
	render() {
		return (
			<AuthContext.Provider value={this.state}>
				<Header />
				{!this.state.isLoggedIn ? "" : <Navbar />}
				<Routes>
					<Route index element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <Game />} />
					<Route path="signin" element={this.state.isLoggedIn ? <Navigate to="/game" /> : <Signin />} />
					<Route path="game" element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <Game />}/>
					<Route path="leaderboard" element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <Leaderboard />} />
					<Route path="chat" element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <Chat />}/>
					<Route path="user"element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <User />}/>
				</Routes>
			</AuthContext.Provider>
		);
	}
}

export default App;