import React from 'react';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';
import { GameChat } from './gameChat';
import './game.css';

export function Game()
:  JSX.Element
{
	return (
		<main>
			<Header />
			<Navbar />
			<section id="gameSection">
				<div id="game">
					<canvas>
					</canvas>
				</div>
				<GameChat />
			</section>
		</main>
	);
}
