import {useEffect, useState} from 'react';

import { useAuth } from '../../services/auth.service';
import { ILeaderboard, getLeaderboard } from '../utils/requester';
import { Entry } from './entry';

import './leaderboard.css';

export function Leaderboard() {

	const {checkLogin} = useAuth();

	const [leaderboard, setLeaderboard] = useState< ILeaderboard[] | null >([]);

	const waitLeaderboard = async () => {
		const _leaderboard :ILeaderboard[] = await getLeaderboard();
		setLeaderboard( _leaderboard );
	};

	useEffect( () => {
		checkLogin();
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
