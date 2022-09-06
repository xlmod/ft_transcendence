import React from 'react';
import {Navigate} from 'react-router';
import {iaxios} from "../../utils/axios";

import './user.css';

import {Button} from '../utils/button';
import {Useredit} from './useredit';

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

		this.updateUserData = this.updateUserData.bind(this);
		this.closeUserEdit = this.closeUserEdit.bind(this);
	}

	getUid = async () => {
		return await iaxios.get('/user/me')
			.then( (data) => {
				return data.data.uid;
			}).catch( () => {return ""});
	};
	getUser = async (uid: string) => {
		return await iaxios.get('/user/' + uid)
			.then( (data) => {
				return  data.data;
			}).catch(() => {return []});
	};
	getAvatar = async (uid: string) => {
		return await iaxios.get('/profile/' + uid)
			.then( (data) => {
				return  data.data;
			}).catch(() => {return []});
	};

	async updateUserData() {
		let uid = await this.getUid();
		let connected:boolean = false;
		let user: any = {};
		if (uid !== "") {
			user = await this.getUser(uid);
			connected = true;
		}
		console.log(await this.getAvatar(uid));
		if (user !== this.state.user) {
			this.setState({
				user: user,
				uid: uid,
				connected: connected,
			});
		}
	}

	async componentDidMount() {
		await this.updateUserData();
	}


	closeUserEdit(update: boolean) {
		this.setState({edit:false});
		if (update)
			this.updateUserData();
	}

	render() {
		if (!this.state.connected)
			return(<Navigate to="/signin" />);
		return (
			<main>
				<section id="user-section">
					{this.state.edit && <Useredit close={this.closeUserEdit} pseudo={this.state.user.pseudo} />}
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
