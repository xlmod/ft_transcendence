import { useRef, useEffect } from "react";
import { GameEngine } from "./gameEngine"

export function GameCanvas(): JSX.Element {

	let canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (canvasRef.current) {
			let canvas = canvasRef.current;
			GameEngine(canvas);
		}
	}, []);

	return (<canvas ref={canvasRef} id="game"></canvas>);

}
