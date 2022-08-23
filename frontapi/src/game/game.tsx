import { useState } from 'react';

import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';
import { GameCanvas } from './gameCanvas';
import { amIAuthorized } from '../middleware';
import './game.css';
import { io } from 'socket.io-client'

export const socket = io('http://localhost:3333', { transports: ['websocket']});

export function Game()
:  JSX.Element
{

	const [left, setLeft] = useState<number>(0);
	const [right, setRight] = useState<number>(0);

	// if( !amIAuthorized() )
	// 	return(
	// 		<h1>
	// 		</h1>
	// 	);
	
	socket.on('connect', () => {
		console.log(socket.id);
	});
	socket.on('disconnect', () => {
		console.log(socket.id);
	});
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
