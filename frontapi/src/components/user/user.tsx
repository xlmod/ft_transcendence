import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../services/auth.service';

import { IUser, IMatchHistory,
		getUser, getAvatar, getMatchHistory } from '../utils/requester';
import { Button } from '../utils/button';
import { QRCode } from './qr_code';
import { Useredit } from './useredit';
import { Userdelete } from './userdelete';
import { EntryMatch } from './entry_match';

import './user.css';

export function User() {

	const {checkLogin} = useAuth();

	const [update, setUpdate] = useState({});
	const [edit, setEdit] = useState<boolean>(false);
	const [del, setDel] = useState< boolean >( false );
	const [me, setMe] = useState< IUser | null >( null );
	const [user, setUser] = useState< IUser | null >( null );
	const [matchHistory, setMatchHistory] = useState< IMatchHistory[] | null >([]);
	const [avatar, setAvatar] = useState< Blob >();
	const { pseudo } = useParams();

	const navigate = useNavigate();

	const waitMe = async() => {
		const _me :IUser = await getUser("");
		setMe( _me );
	};

	const waitUserMatch = async( _pseudo :string ) => {
		const _user :IUser = await getUser( _pseudo );
		if (!_user)
			navigate("/user");
		const _matchHistory :IMatchHistory[] = await getMatchHistory( _pseudo!==""?_user.id:"");
		const _avatar :Blob = await getAvatar( _user.id );
		setUser( _user );
		setMatchHistory( _matchHistory );
		setAvatar( _avatar );
	}; 

	useEffect(() => {
		checkLogin();
		waitMe();
		waitUserMatch( pseudo?pseudo:"" );
	}, [edit, pseudo, update]);


	return (
		<main>
			<section id="user-section">
				{me && edit ? <Useredit close={() => { setEdit(false) }}
							pseudo={me.pseudo}
							tfa={me.TwoFactorAuthToggle}/> : "" }
				<div id="user-id"
					onMouseEnter={ () => { setUpdate({}) } }
					onMouseLeave={ () => { setUpdate({}) } }>
					<div id="user-id-avatar">
						<img src={avatar?URL.createObjectURL( avatar ):'./default-profile.jpg'}
							alt="avatar"/>
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
