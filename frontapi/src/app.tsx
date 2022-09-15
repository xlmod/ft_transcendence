import React from 'react';
import { AuthContext } from './services/auth.service';
import { Signin } from './components/signin/signin';
import { Game } from './components/game/game';
import { Leaderboard } from './components/leaderboard/leaderboard';
import { Chat } from './components/chat/chat';
import { User } from './components/user/user';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from "axios";
import { Header } from './components/header/header';
import { Navbar } from './components/navbar/navbar';
import {game_socket} from './socket';
import {Gameinvitation} from './components/game/gameinvitation';

import { TFA } from './components/tfa/tfa';

const API_URL = "http://localhost:3333/";
class App extends React.Component<{}, {userData: {}, isLoggedIn: boolean, checkLogin:any, logout:any, pseudo: string, obj: any, code: string}> {
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
	logout = () => {
		axios.get( 'http://localhost:3333/auth/logout', { withCredentials: true } );
		this.setState({
			userData: {},
			isLoggedIn : false
		});
		game_socket.socket.disconnect();
	}
	constructor(props)
	{
		super(props);
		this.state = {
			userData : {},
			isLoggedIn : false,
			checkLogin : this.checkLogin,
			logout: this.logout,
			pseudo: "",
			obj: {},
			code: "",
		}
		this.removeInvite = this.removeInvite.bind(this);
	};
	componentDidMount(): void {
		game_socket.socket.on("invitation", (pseudo, obj) => { 
			this.setState({pseudo: pseudo, obj: obj});
		});
	}

	componentWillUnmount(): void {
		game_socket.socket.off("invitation");
	}

	removeInvite = (code: string) => {
		if (code !== "")
			this.setState({code: code});
		this.setState({pseudo: ""});
	};
	
	render() {
		if (this.state.code != "") {
			let code = this.state.code;
			this.setState({code: ""});
			return (<Navigate to={"/game/" + code} />);
		}
		return (
			<AuthContext.Provider value={this.state}>
				<Header />
				{!this.state.isLoggedIn ? "" : <Navbar />}
				<Routes>
					<Route index element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <Game />} />
					<Route path="signin" element={this.state.isLoggedIn ? <Navigate to="/game" /> : <Signin />} />
					<Route path="game" element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <Game />}/>
					<Route path="game/:code" element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <Game invitation={true}/>}/>
					<Route path="leaderboard" element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <Leaderboard />} />
					<Route path="chat" element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <Chat />}/>
					<Route path="user" element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <User />}/>
					<Route path="user/:pseudo" element={!this.state.isLoggedIn ? <Navigate to="/signin" /> : <User />}/>
					<Route path="tfa" element={ <TFA /> } />
					<Route path="*" element={<section id="navbarText" ><h1>404 Page not found</h1></section>}/>{/* we need to add a 404 route/page */}
				</Routes>
				{this.state.pseudo !== "" && <Gameinvitation pseudo={this.state.pseudo} obj={this.state.obj} close={this.removeInvite} />}
			</AuthContext.Provider>
		);
	}
}

export default App;
