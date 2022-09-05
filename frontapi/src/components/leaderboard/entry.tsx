import React from 'react';

import './leaderboard.css';


interface IProps {
	rank: number,
	pseudo: string,
	elo: number,
}

interface IState {}

export class Entry extends React.Component< IProps, IState >
{

	constructor(props: IProps) {
		super(props);
	}

	render(): React.ReactNode {
		return (
			<div className="leaderboard-entry">
				<div className="leaderboard-cell">{this.props.rank}</div>
				<div className="leaderboard-cell">{this.props.pseudo}</div>
				<div className="leaderboard-cell">{this.props.elo}</div>
			</div>
		);
	}
}
