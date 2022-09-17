import { Pseudo } from '../utils/pseudo';

import './leaderboard.css';


interface IProps {
	rank: number,
	pseudo: string,
	elo: number,
}

export function Entry(props: IProps) {

	return (
		<div className="leaderboard-entry">
			<div className="leaderboard-cell">{props.rank}</div>
			<Pseudo pseudo={ props.pseudo } isDeleted={false}
				pseudoClassName="leaderboard-cell" menuClassName="menu-leaderboard" />
			<div className="leaderboard-cell">{props.elo}</div>
		</div>
	);
}
