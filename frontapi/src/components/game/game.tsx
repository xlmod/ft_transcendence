import { useContext, useState } from 'react';
import {Navigate} from 'react-router-dom';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';
import { GameCanvas } from './gameCanvas';
import './game.css';
import { AuthContext } from '../../services/auth.service';


export function Game()
:  JSX.Element
{
	const {checkLogin} = useContext(AuthContext);
	checkLogin();
	const [left, setLeft] = useState<number>(0);
	const [right, setRight] = useState<number>(0);

	const incLeft = () => { setLeft(left + 1) };
	const incRight = () => { setRight(right + 1) };

	return (
		<main>
			<section id="gameSection">
				<div id="gameScore">
					{left} - {right}
				</div>
				<GameCanvas incLeft={incLeft} incRight={incRight} left={left} right={right} />
			</section>
		</main>
	);
}
