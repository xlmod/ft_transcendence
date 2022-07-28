import React from 'react';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';
import { GameChat } from './gameChat';
import { GameCanvas } from './gameCanvas';
import './game.css';

export function Game()
:  JSX.Element
{
	return (
		<main>
			<Header />
			<Navbar />
			<section id="gameSection">
				<GameCanvas />
			</section>
		</main>
	);
}
