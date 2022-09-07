import {useContext, useEffect, useState} from 'react';
import {Entry} from './entry';

import { AuthContext } from '../../services/auth.service';

import './leaderboard.css';
import {iaxios} from '../../utils/axios';

export function Leaderboard() {

	const {checkLogin} = useContext(AuthContext);
	checkLogin();

	const [entrylist, setEntrylist] = useState<[React.ReactNode | null]>([null]);
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
			}).catch(() => {return []});
	};

	useEffect(() => {
		getLeaderboard().then((leaderboard) => {
			setEntrylist([null]);
			for (const [i, obj] of leaderboard.entries()) {
				addEntry(obj.id, i + 1, obj.pseudo, obj.elo, obj.isfriend);
				updateState({});
			}
		});
	}, []);

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
