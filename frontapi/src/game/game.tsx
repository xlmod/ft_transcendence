import { useState } from 'react';

import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';
import { GameCanvas } from './gameCanvas';
import { amIAuthorized } from '../middleware';
import './game.css';

import { game_socket_init } from '../socket';


export function Game()
:  JSX.Element
{
	
	game_socket_init();
	const [left, setLeft] = useState<number>(0);
	const [right, setRight] = useState<number>(0);

	// if( !amIAuthorized() )
	// 	return(
	// 		<h1>
	// 		</h1>
	// 	);
	
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
				<GameCanvas incLeft={incLeft} incRight={incRight} left={left} right={right} />
			</section>
		</main>
	);
}
