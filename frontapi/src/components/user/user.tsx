import {useContext, useEffect, useState} from 'react';
import { Navigate, useParams } from 'react-router';

import { AuthContext } from '../../services/auth.service';
import {iaxios} from "../../utils/axios";

import { IMatchHistory, getMatchHistory, getMatchHistoryID, IUser,
		getMe, getMePseudo, getAvatar, getFriends, getBlocked } from '../utils/requester';
import { Button } from '../utils/button';
import { Pseudo } from '../utils/pseudo';
import {Useredit} from './useredit';
import { EntryMatch } from './entry_match';

import './user.css';

export function User() {

	const {checkLogin} = useContext(AuthContext);
	checkLogin();

	const [edit, setEdit] = useState<boolean>(false);
	const [me, setMe] = useState< IUser | null >( null );
	const [user, setUser] = useState< IUser | null >( null );
	const [ friends, setFriends] = useState< IUser[] | null >([]);
	const [ blocked, setBlocked] = useState< IUser[] | null >([]);
	const [matchHistory, setMatchHistory] = useState< IMatchHistory[] | null >([]);
	const [avatar, setAvatar] = useState< File | null >();
	const { pseudo } = useParams();
/*
	const getAvatar = async (uid: string) => {
		return await iaxios.get('/profile/' + uid)
			.then( (data) => {
				return  data.data;
			}).catch(() => {return []});
	};
*/
	const waitMe = async() => {
		const _me :IUser = await getMe();
		setMe( _me );
	};

	const waitFriends = async() => {
		const arrayFriends :IUser[] = await getFriends();
		setFriends( arrayFriends );
	};

	const waitBlocked = async() => {
		const arrayBlocked :IUser[] = await getBlocked();
		setBlocked( arrayBlocked );
	};

	const waitUserMatch = async( _pseudo :string ) => {
		if( !_pseudo )
		{
			const _user :IUser = await getMe();
			const _matchHistory :IMatchHistory[] = await getMatchHistory();
			const _avatar :File = await getAvatar( _user.id );
			setUser( _user );
			setMatchHistory( _matchHistory );
			setAvatar( _avatar );
		}
		else
		{
			const _user :IUser = await getMePseudo( _pseudo );
			const _matchHistory :IMatchHistory[] = await getMatchHistoryID( _user?_user.id:"" );
			const _avatar :File = await getAvatar( _user.id );
			setUser( _user );
			setMatchHistory( _matchHistory );
			setAvatar( _avatar );
		}
	}; 

	const closeUserEdit = () => {
		setEdit(false);
	}

	useEffect(() => {
		waitMe();
		waitFriends();
		waitBlocked();
		waitUserMatch( pseudo?pseudo:"" );
	}, [edit, pseudo]);

	return (
		<main>
			<section id="user-section">
				{user && edit && <Useredit close={closeUserEdit}
							pseudo={user.pseudo?user.pseudo:""}
							tfa={user.TwoFactorAuthToggle?user.TwoFactorAuthToggle:true}/>}
				<div id="user-id">
					<div id="user-id-avatar">
						<img src={avatar?"yes":"no"}/>
					</div>
					<div id="user-id-info">
						<div id="user-id-name">
							<p>{ user?user.firstName:""  } { user?user.lastName:"" }</p>
						</div>
						<div id="user-id-pseudo">
							{ pseudo && me && me.pseudo !== pseudo
								? <Pseudo pseudo={ user?user.pseudo:"" }
									isFriend={ friends &&
										friends.find( friend => friend.pseudo === (user?user.pseudo:"") )
										? true : false }
									isBlocked={ blocked &&
										blocked.find( block => block.pseudo === (user?user.pseudo:"") )
										? true : false }
									pseudoClassName="pseudo-single" menuClassName="menu-match" />
								: <p>{ user?user.pseudo:"" }</p> }
						</div>
						<div id="user-id-elo">
							<p>{user?user.elo:""}</p>
						</div>
						{ user && me && me.pseudo !== user.pseudo
							? ""
							: <Button id="user-info-edit" value="edit info"
								fontSize={0.7} onClick={() => {setEdit(true)}} /> }
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
								rscore= { match.rscore } luser={ match.luser } ruser={ match.ruser }
								isFriend={ ( friends &&
										friends.find( friend => friend.pseudo ===
											( me && match.ruser.pseudo === me.pseudo
												? match.luser.pseudo : match.ruser.pseudo ) )
										? true : false ) }
								isBlocked={ ( blocked &&
										blocked.find( block => block.pseudo ===
											( me && match.ruser.pseudo === me.pseudo
												? match.luser.pseudo : match.ruser.pseudo ) )
										? true : false ) } />
						) ) : "" }
					</table>
				</div>
			</section>
		</main>
	);

}
