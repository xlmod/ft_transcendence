import { useContext } from 'react';
import { AuthContext } from '../../services/auth.service';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';

import './leaderboard.css';

export function Leaderboard()
: JSX.Element
{
	const {checkLogin} = useContext(AuthContext);
	checkLogin();
	return (
		<main>
			<section id="leaderboardSection">
			<table id="leaderboard">
				<tr>
					<th>Rank</th>
					<th>Points</th>
					<th>Pseudo</th>
				</tr>
				<tr>
					<td>1</td>
					<td>4242</td>
					<td>Darth Vador</td>
				</tr>
				<tr>
					<td>2</td>
					<td>42</td>
					<td>Yoda</td>
				</tr>
				<tr>
					<td>3</td>
					<td>42</td>
					<td>Anakin Skywalker</td>
				</tr>
				<tr>
					<td>4</td>
					<td>4.2</td>
					<td>Princess Leïa</td>
				</tr>
			</table>
			</section>
		</main>
	);
}