import { useEffect, useState} from 'react';
import {Entry} from './entry';

import './leaderboard.css';
import {iaxios} from '../../utils/axios';
import {Navigate} from 'react-router';

export function Leaderboard() {

	const [entrylist, setEntrylist] = useState<[React.ReactNode | null]>([null]);
	const [connected, setConnected] = useState<boolean>(true);
	const [,updateState] = useState<{}>();

	const addEntry = (uid: string, rank: number, pseudo: string, elo: number, isfriend: boolean) => {
		let entries = entrylist;
		entries.push(<Entry rank={rank} pseudo={pseudo} elo={elo} isfriend={isfriend} uid={uid}/>);	
		setEntrylist(entries);
	}

	const getLeaderboard = async () => {
		return await iaxios.get('/user/leaderboard')
			.then((data) => {
				return  data.data;
			}).catch(() => {return null});
	};

	useEffect(() => {
		getLeaderboard().then((leaderboard) => {
			if (leaderboard == null) {
				setConnected(false);
			}
			setEntrylist([null]);
			for (const [i, obj] of leaderboard.entries()) {
				addEntry(obj.id, i + 1, obj.pseudo, obj.elo, obj.isfriend);
				updateState({});
			}
		});
	}, []);

	if (!connected)
		return(<Navigate to="/signin" />);
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
					{entrylist}
				</div>
			</div>
			</section>
		</main>
	);
}
