import { Pseudo } from '../utils/pseudo';

import './leaderboard.css';


interface IProps {
	rank: number,
	pseudo: string,
	elo: number,
	isfriend: boolean,
	isblocked: boolean
}

export function Entry(props: IProps) {

	return (
		<div className="leaderboard-entry">
			<div className="leaderboard-cell">{props.rank}</div>
			<Pseudo pseudo={ props.pseudo }
				isFriend={ props.isfriend } isBlocked={ props.isblocked }
				pseudoClassName="leaderboard-cell" menuClassName="menu-leaderboard" />
			<div className="leaderboard-cell">{props.elo}</div>
		</div>
	);
}
