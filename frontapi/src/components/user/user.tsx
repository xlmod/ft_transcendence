import React from 'react';
import {Navigate} from 'react-router';
import axios from 'axios';

import './user.css';

import {Button} from '../utils/button';
import {Useredit} from './useredit';

const API_URL = "http://localhost:3333/";

interface IProps {}

interface IState {
	user: any,
	uid: string,
	connected: boolean,
	edit: boolean,
}

export class User extends React.Component< IProps, IState >
{
	constructor(props: IProps)
	{
		super(props);
		this.state = {
			user: [],
			uid: "",
			connected: true,
			edit: false,
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
				<section id="user-section">
					{this.state.edit && <Useredit close={() => {this.setState({edit:false})}} pseudo={this.state.user.pseudo} />}
					<div id="user-id">
						<div id="user-id-avatar">
							<img src ={ this.state.user.avatar }/>
						</div>
						<div id="user-id-info">
							<div id="user-id-name">
								<p>{ this.state.user.firstName } {this.state.user.lastName}</p>
							</div>
							<div id="user-id-pseudo">
								<p>{ this.state.user.pseudo }</p>
							</div>
							<div id="user-id-elo">
								<p>{this.state.user.elo}</p>
							</div>
							<Button id="user-info-edit" value="edit info" fontSize={0.7} onClick={() => this.setState({edit:true})} />
						</div>
					</div>
					<div id="user-matchhistory">
						<div className="user-title">Match History</div>
						<div className="user-list">
						</div>
					</div>
				</section>
			</main>
		);
	}
}
