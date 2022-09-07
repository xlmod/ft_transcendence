
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
			<div className="leaderboard-cell">{props.pseudo}</div>
			<div className="leaderboard-cell">{props.elo}</div>
		</div>
	);
}
