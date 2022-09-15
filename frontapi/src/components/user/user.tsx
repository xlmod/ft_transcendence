import { useContext, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';

import { AuthContext } from '../../services/auth.service';
import { iaxios } from "../../utils/axios";

import { IUser, IMatchHistory,
		getUser, getAvatar, getMatchHistory } from '../utils/requester';
import { Button } from '../utils/button';
import { Pseudo } from '../utils/pseudo';
import { QRCode } from './qr_code';
import { Useredit } from './useredit';
import { Userdelete } from './userdelete';
import { EntryMatch } from './entry_match';

import './user.css';

export function User() {

	const {checkLogin} = useContext(AuthContext);
	checkLogin();

	const [edit, setEdit] = useState<boolean>(false);
	const [del, setDel] = useState< boolean >( false );
	const [me, setMe] = useState< IUser | null >( null );
	const [user, setUser] = useState< IUser | null >( null );
//	const [ friends, setFriends] = useState< IUser[] | null >([]);
//	const [ blocked, setBlocked] = useState< IUser[] | null >([]);
	const [matchHistory, setMatchHistory] = useState< IMatchHistory[] | null >([]);
	const [avatar, setAvatar] = useState< Blob >();
	const { pseudo } = useParams();

	const waitMe = async() => {
		const _me :IUser = await getUser("");
		setMe( _me );
	};
/*
	const waitFriends = async() => {
		const arrayFriends :IUser[] = await getFriends();
		setFriends( arrayFriends );
	};

	const waitBlocked = async() => {
		const arrayBlocked :IUser[] = await getBlocked();
		setBlocked( arrayBlocked );
	};
*/
	const waitUserMatch = async( _pseudo :string ) => {
		const _user :IUser = await getUser( _pseudo );
		const _matchHistory :IMatchHistory[] = await getMatchHistory( _pseudo!==""?_user.id:"");
		const _avatar :Blob = await getAvatar( _user.id );
		setUser( _user );
		setMatchHistory( _matchHistory );
		setAvatar( _avatar );
	}; 

	useEffect(() => {
		checkLogin();
		waitMe();
//		waitFriends();
//		waitBlocked();
		waitUserMatch( pseudo?pseudo:"" );
	}, [edit, pseudo]);


	return (
		<main>
			<section id="user-section">
				{me && edit && <Useredit close={() => {setEdit(false)}}
							pseudo={me.pseudo}
							tfa={me.TwoFactorAuthToggle}/>}
				<div id="user-id">
					<div id="user-id-avatar">
						<img src={avatar?URL.createObjectURL( avatar ):'./default-profile.jpg'} />
					</div>
					<div id="user-id-info">
						<div id="user-id-name">
							<p>{ user?user.firstName:""  } { user?user.lastName:"" }</p>
						</div>
						<div id="user-id-pseudo">
							{ pseudo && me && me.pseudo !== pseudo
								? /*<Pseudo pseudo={ user?user.pseudo:"" }
									pseudoClassName="pseudo-single" menuClassName="menu-single-user" />*/
									<p>{ user?user.pseudo:"" }</p>
								:	<p>{ user?user.pseudo:"" }</p> }
						</div>
						<div id="user-id-elo">
							<p>{user?user.elo:""}</p>
						</div>
						<div id="stats-qr">
							<div id="stats">
								<span id="victories">V{user?user.win:""}</span>|
								<span id="defeats">D{user?user.lose:""}</span>
							</div>
							{ user && me && ( me.pseudo !== user.pseudo || !me.TwoFactorAuthToggle )
								?	""
								:	<QRCode /> }

						</div>
						{ user && me && me.pseudo !== user.pseudo
							?	""
							:	<Button id="user-info-edit" value="edit info"
								fontSize={0.7} onClick={() => {setEdit(true)}} /> }
						{ user && me && me.pseudo !== user.pseudo
							?	""
							:	<Button id="user-delete" value="delete account"
									fontSize={0.4} onClick={() => { setDel( true ); } } /> }
						{ del && <Userdelete close={setDel} /> }
					</div>
				</div>

				<div id="user-matchhistory">
					<div className="user-title">Match History</div>
					<table className="user-list" id="match-history">
						<tr>
							<th>Opponent</th>
							<th>Score</th>
							<th>Date</th>
						</tr>
						{ matchHistory ? matchHistory.map( match => (
							<EntryMatch pseudoViewer={ user?user.pseudo:"" }
								date={ match.CreatedAt }
								leftwin={ match.leftwin } lscore={ match.lscore }
								rscore= { match.rscore } luser={ match.luser } ruser={ match.ruser } />
						) ) : "" }
					</table>
				</div>
			</section>

		</main>
	);

}
