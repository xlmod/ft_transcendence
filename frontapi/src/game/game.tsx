import { useEffect, useState } from 'react';
import {Navigate} from 'react-router-dom';

import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';
import { GameCanvas } from './gameCanvas';
import { amIAuthorized } from '../middleware';
import axios from 'axios';
import './game.css';


export function Game()
:  JSX.Element
{
	
	const [left, setLeft] = useState<number>(0);
	const [right, setRight] = useState<number>(0);
	const [unauthorized, setUnauthorized] = useState<boolean>(false);

	const [data, setData] = useState<any>(0);

	useEffect(() => {
		axios
		.get("http://localhost:3333/user/me", {withCredentials: true})
		.then((responce) => {setData(responce.data);})
		.catch((err) => {setUnauthorized(true)});
		console.log(data);
	}, []);

	if (unauthorized)
		return <Navigate to={'/'}/>
	
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
