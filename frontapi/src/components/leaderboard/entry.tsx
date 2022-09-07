import { Pseudo } from '../utils/pseudo';

import './leaderboard.css';


interface IProps {
	uid: string,
	rank: number,
	pseudo: string,
	elo: number,
	isfriend: boolean,
}

export function Entry(props: IProps) {

	return (
		<div className="leaderboard-entry">
			<div className="leaderboard-cell">{props.rank}</div>
			<Pseudo uid={ props.uid } pseudo={ props.pseudo }
				isFriend={ props.isfriend } isBlocked={ false }
				pseudoClassName="leaderboard-cell" menuClassName="menu-leaderboard" />
			<div className="leaderboard-cell">{props.elo}</div>
		</div>
	);
}
