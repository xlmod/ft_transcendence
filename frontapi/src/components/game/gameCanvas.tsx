import { useRef, useEffect, useState } from "react";
import {BASE_WIDTH} from "./gameTypes/base";
import { Board } from "./gameTypes/Board";
import {GAME_SETTINGS} from "./gameTypes/GameSettings";

export function GameCanvas(props: {incLeft: () => void, incRight: () => void, left: number, right: number}): JSX.Element {

	let canvasRef = useRef<HTMLCanvasElement | null>(null);

	const [started, setStarted] = useState<boolean>(false)
	const [count, setCount] = useState<number>(0)

	const board = new Board();
	board.reset();
	board.set_ball_dir(-1, 0);
	let reqanim: any = true;

	const setup_key = () => {
		document.addEventListener('keydown', (e) => {
			if (e.key === "ArrowUp")
				board.set_right_dir(0, -1);
			else if (e.key === "ArrowDown")
				board.set_right_dir(0, 1);
			else if (e.key === "z")
				board.set_left_dir(0, -1);
			else if (e.key === "s")
				board.set_left_dir(0, 1);
		});
		document.addEventListener('keyup', (e) => {
			if (e.key === "ArrowUp" || e.key === "ArrowDown")
				board.set_right_dir(0, 0);
			else if (e.key === "z" || e.key === "s")
				board.set_left_dir(0, 0);
		});
	}
	setup_key();

	useEffect(() => {
		if (props.left === 10)
			console.log('LEFT WON');
		else if (props.right === 10)
			console.log('RIGHT WON');
		else if (canvasRef.current) {
			let canvas = canvasRef.current;
			canvas.width = 1000;
			canvas.height = 500;
			GAME_SETTINGS.ratio = ((canvas.width / BASE_WIDTH));
			const ctx = canvas?.getContext("2d");
			if (ctx) {
				const renderLoop = () => {
					// Comment start
					if (board.tick())
						reqanim = false;
					// Comment End
					ctx.beginPath();
					board.draw(ctx, GAME_SETTINGS.ratio);
					ctx.stroke();
					if (reqanim)
						reqanim = requestAnimationFrame(renderLoop);
				}
				const stopLoop = () => {
					if (reqanim)
					{
						cancelAnimationFrame(reqanim);
						reqanim = undefined;
					}
				}
				// Comment Start
			//	const interval = setInterval(() => {
			//		board.tick();
			//	}, 16);
				// Comment End
				renderLoop();
		console.log("test");
				return () => {stopLoop();}
			}
		}
	}, []);
/*
	useEffect(() => {
		
		const interval = setInterval(() => {
			let ret = board.tick();
			console.log(ret);
		}, 10);
	}, []);
*/


	return (<canvas ref={canvasRef} id="game"></canvas>);

}
