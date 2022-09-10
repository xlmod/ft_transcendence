import {useContext, useEffect, useState} from 'react';
import {Entry} from './entry';

import { AuthContext } from '../../services/auth.service';
import { ILeaderboard, getLeaderboard, IUser, getBlocked } from '../utils/requester';

import './leaderboard.css';
import {iaxios} from '../../utils/axios';

export function Leaderboard() {

	const {checkLogin} = useContext(AuthContext);
	checkLogin();

	const [leaderboard, setLeaderboard] = useState< ILeaderboard[] | null >([]);
	const [blocked, setBlocked] = useState< IUser[] | null >([]);

	const waitLeaderboard = async () => {
		const _leaderboard :ILeaderboard[] = await getLeaderboard();
		setLeaderboard( _leaderboard );
	};

	const waitBlocked = async () => {
		const _blocked :IUser[] = await getBlocked();
		setBlocked( _blocked );
	};

	useEffect( () => {
		waitLeaderboard();
		waitBlocked();
	}, [] );

	let index = 1;

	return (
		<main>
			<section id="leaderboard-section">
			<div id="leaderboard-table">
				<div id="leaderboard-header">
					<div className="leaderboard-header-cell">RANK</div>
					<div className="leaderboard-header-cell">PSEUDO</div>
					<div className="leaderboard-header-cell">ELO</div>
				</div>
				<div id="leaderboard-entry-list">
					{ leaderboard ? leaderboard.map( entry => (
						<Entry rank={ index++ } pseudo={ entry.pseudo } elo={ entry.elo }
							isfriend={ entry.isfriend }
							isblocked={ ( blocked &&
										blocked.find( user => user.pseudo === entry.pseudo ) ) ?
										true : false } />
					)) : "" }
				</div>
			</div>
			</section>
		</main>
	);
}
