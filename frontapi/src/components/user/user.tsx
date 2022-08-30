import React, {useContext} from 'react';
import {Navigate} from 'react-router';
import axios from 'axios';

import './user.css';
import { AuthContext } from '../../services/auth.service';

const API_URL = "http://localhost:3333/";

interface IProps {}

interface IState {
	user: any,
	uid: string,
	connected: boolean,
}

export class User extends React.Component< IProps, IState >
{
	constructor(props: IProps)
	{
		//CheckLogin();
		super(props);
		this.state = {
			user: [],
			uid: "",
			connected: true,
		};
	}

	async componentDidMount() {
		const getUid = async () => {
			return await axios.get( API_URL + 'user/me', { withCredentials: true } )
				.then( (data) => {
					return data.data.uid;
				}).catch( () => {return ""});
		};
		const getUser = async (uid: string) => {
			return await axios.get(API_URL + 'user/' + uid, {withCredentials: true})
				.then( (data) => {
					return  data.data;
				}).catch(() => {return []});
		};
		let uid = await getUid();
		let connected:boolean = false;
		let user: any = {};
		if (uid !== "") {
			user = await getUser(uid);
			connected = true;
		}
		this.setState({
			user: user,
			uid: uid,
			connected: connected,
		});
	}

	render() {
		if (!this.state.connected)
			return(<Navigate to="/signin" />);
		return (
			<main>
				<section id="userSection">
					<div id="me">
						<h1>ID</h1>
						<img src ={ this.state.user.avatar }/>
						<p>
							<span>First__</span>
							<span>{ this.state.user.firstName }</span>
						</p>
						<p>
							<span>Last__</span>
							<span>{ this.state.user.lastName }</span>
						</p>
						<p>
							<span>Pseudo__</span>
							<span>{ this.state.user.pseudo }</span>
						</p>
						<p>
							<span>Points__</span>
							<span id="points">42</span>
						</p>
					</div>
				</section>
			</main>
		);
	}
}

const CheckLogin = () => {
	const {checkLogin} = useContext(AuthContext);
	checkLogin();
	
}
