import React, {useState} from 'react';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';
import { GameChat } from './gameChat';
import { GameCanvas } from './gameCanvas';
import './game.css';

export function Game()
:  JSX.Element
{

	const [left, setLeft] = useState<number>(0);
	const [right, setRight] = useState<number>(0);

	const incLeft = () => { setLeft(left + 1) };
	const incRight = () => { setRight(right + 1) };

	return (
		<main>
			<Header />
			<Navbar />
			<section id="gameSection">
				<div id="gameScore">
					{left} - {right}
				</div>
				<GameCanvas incLeft={incLeft} incRight={incRight} left={left} right={right}/>
			</section>
		</main>
	);
}
