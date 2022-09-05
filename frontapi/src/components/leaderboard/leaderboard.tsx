import React from 'react';
import {Entry} from './entry';

import './leaderboard.css';


interface IProps {}

interface IState {
	entrylist: [React.ReactNode | null],
}

export class Leaderboard extends React.Component< IProps, IState >
{

	constructor(props: IProps) {
		super(props);

		this.state = {entrylist:[null]}
		this.addEntry = this.addEntry.bind(this);
	}

	componentDidMount() {
		this.addEntry(1, "guest", 1600);
		this.addEntry(2, "guest", 1600);
		this.addEntry(3, "guest", 1600);
		this.addEntry(4, "guest", 1600);
		this.addEntry(5, "guest", 1600);
		this.addEntry(6, "guest", 1600);
		this.addEntry(7, "guest", 1600);
		this.addEntry(8, "guest", 1600);
		this.addEntry(9, "guest", 1600);
		this.addEntry(10, "guest", 1600);
		this.addEntry(11, "guest", 1600);
		this.addEntry(12, "guest", 1600);
		this.addEntry(13, "guest", 1600);
		this.addEntry(14, "guest", 1600);
		this.addEntry(15, "guest", 1600);
		this.addEntry(16, "guest", 1600);
		this.addEntry(17, "guest", 1600);
		this.addEntry(18, "guest", 1600);
		this.addEntry(19, "guest", 1600);
		this.addEntry(20, "guest", 1600);
		this.addEntry(21, "guest", 1600);
		this.addEntry(22, "guest", 1600);
		this.addEntry(23, "guest", 1600);
		this.addEntry(24, "guest", 1600);
		this.addEntry(25, "guest", 1600);
		this.addEntry(26, "guest", 1600);
		this.addEntry(27, "guest", 1600);
		this.addEntry(28, "guest", 1600);
		this.addEntry(29, "guest", 1600);
		this.addEntry(30, "guest", 1600);
		this.addEntry(31, "guest", 1600);
		this.addEntry(32, "guest", 1600);
		this.addEntry(33, "guest", 1600);
		this.addEntry(34, "guest", 1600);
		this.addEntry(35, "guest", 1600);
		this.addEntry(36, "guest", 1600);
		this.addEntry(37, "guest", 1600);
		this.addEntry(38, "guest", 1600);
		this.addEntry(39, "guest", 1600);
		this.addEntry(40, "guest", 1600);
		this.addEntry(41, "guest", 1600);
		this.addEntry(42, "guest", 1600);
		this.addEntry(43, "guest", 1600);
		this.addEntry(44, "guest", 1600);
		this.addEntry(45, "guest", 1600);
		this.addEntry(46, "guest", 1600);
		this.addEntry(47, "guest", 1600);
		this.addEntry(48, "guest", 1600);
		this.addEntry(49, "guest", 1600);
	}

	addEntry(rank: number, pseudo: string, elo: number) {
		let entries = this.state.entrylist;
		entries.push(<Entry rank={rank} pseudo={pseudo} elo={elo}/>);	
		this.setState({entrylist: entries});
	}

	render(): React.ReactNode {
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
						{this.state.entrylist}
					</div>
				</div>
				</section>
			</main>
		);
	}
}
