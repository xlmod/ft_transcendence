import {useContext, useEffect, useState} from 'react';
import {Navigate} from 'react-router';

import {iaxios} from "../../utils/axios";
import { AuthContext } from '../../services/auth.service';

import './user.css';

import {Button} from '../utils/button';
import {Useredit} from './useredit';

interface IProps {}

export function User(props: IProps) {

	const [user, setUser] = useState<any>([]);
	const [connected, setConnected] = useState<boolean>(true);
	const [edit, setEdit] = useState<boolean>(false);


	const getUid = async () => {
		return await iaxios.get('/user/me')
			.then( (data) => {
				return data.data.uid;
			}).catch( () => {return ""});
	};
	const getUser = async (uid: string) => {
		return await iaxios.get('/user/' + uid)
			.then( (data) => {
				return  data.data;
			}).catch(() => {return []});
	};
	const getAvatar = async (uid: string) => {
		return await iaxios.get('/profile/' + uid)
			.then( (data) => {
				return  data.data;
			}).catch(() => {return []});
	};

	const updateUserData = async () => {
		let uid = await getUid();
		let user_l: any = {};
		if (uid !== "") {
			user_l = await getUser(uid);
		} else {
			setConnected(false);
		}
		let avatar_l = await getAvatar(uid);
		if (user_l !== user) {
			setUser(user_l);
		}
	}

	const closeUserEdit = () => {
		setEdit(false);
	}

	useEffect(() => {
		updateUserData();
	}, [edit]);


	if (!connected)
		return(<Navigate to="/signin" />);
	return (
		<main>
			<section id="user-section">
				{edit && <Useredit close={closeUserEdit} pseudo={user.pseudo} tfa={user.TwoFactorAuthToggle}/>}
				<div id="user-id">
					<div id="user-id-avatar">
						<img src ={ user.avatar }/>
					</div>
					<div id="user-id-info">
						<div id="user-id-name">
							<p>{ user.firstName } {user.lastName}</p>
						</div>
						<div id="user-id-pseudo">
							<p>{ user.pseudo }</p>
						</div>
						<div id="user-id-elo">
							<p>{user.elo}</p>
						</div>
						<Button id="user-info-edit" value="edit info" fontSize={0.7} onClick={() => {setEdit(true)}} />
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
