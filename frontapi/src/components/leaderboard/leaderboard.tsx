import {useContext, useEffect, useState} from 'react';

import { AuthContext } from '../../services/auth.service';
import {iaxios} from '../../utils/axios';
import { ILeaderboard, getLeaderboard } from '../utils/requester';
import { Entry } from './entry';

import './leaderboard.css';

export function Leaderboard() {

	const {checkLogin} = useContext(AuthContext);
	checkLogin();

	const [leaderboard, setLeaderboard] = useState< ILeaderboard[] | null >([]);

	const waitLeaderboard = async () => {
		const _leaderboard :ILeaderboard[] = await getLeaderboard();
		setLeaderboard( _leaderboard );
	};

	useEffect( () => {
		waitLeaderboard();
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
						<Entry rank={ index++ } pseudo={ entry.pseudo } elo={ entry.elo } />
					)) : "" }
				</div>
			</div>
			</section>
		</main>
	);
}
