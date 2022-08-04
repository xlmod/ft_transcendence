import { useRef, useEffect, useState } from "react";
import { GameEngine } from "./gameEngine"

export function GameCanvas(props: {incLeft: () => void, incRight: () => void, left: number, right: number}): JSX.Element {

	let canvasRef = useRef<HTMLCanvasElement | null>(null);

	const [replay, setReplay] = useState<boolean>(true);

	const newGame = () => { setReplay(!replay) };

	useEffect(() => {
		if (props.left == 10)
			console.log('LEFT WON');
		else if (props.right == 10)
			console.log('RIGHT WON');
		else if (canvasRef.current) {
			let canvas = canvasRef.current;
			canvas.width = 1000;
			canvas.height = 500;
			GameEngine(canvas, {incLeft:props.incLeft, incRight:props.incRight, newGame:newGame});
		}
	}, [replay]);

	return (<canvas ref={canvasRef} id="game"></canvas>);

}
