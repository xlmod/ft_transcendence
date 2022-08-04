import { BASE_WIDTH} from "./gameTypes/base";
import { Board } from "./gameTypes/Board"
import {GAME_SETTINGS} from "./gameTypes/GameSettings";

export function GameEngine(canvas: HTMLCanvasElement, props: {incLeft: () => void, incRight: () => void}) {
	const ctx = canvas.getContext('2d');
	if (ctx) {
		
		const board: Board = new Board();
		var reqanim: any = true;
		GAME_SETTINGS.ratio = ((canvas.width / BASE_WIDTH));


		const setup_key = () => {
			document.addEventListener('keydown', (e) => {
				if (e.key === "ArrowUp")
					board.set_right_dir(0, -1);
				else if (e.key === "ArrowDown")
					board.set_right_dir(0, 1);
				else if (e.key === "w")
					board.set_left_dir(0, -1);
				else if (e.key === "s")
					board.set_left_dir(0, 1);
			});
			document.addEventListener('keyup', (e) => {
				if (e.key === "ArrowUp" || e.key === "ArrowDown")
					board.set_right_dir(0, 0);
				else if (e.key === "w" || e.key === "s")
					board.set_left_dir(0, 0);
			});
		}

		const renderLoop = () => {
			const ret: boolean = board.tick();
			if (ret)
				stopLoop();
			drawPong();
			
			if (reqanim)
				reqanim = requestAnimationFrame(renderLoop);
		}

		const stopLoop = () => {
			if (reqanim)
			{
				cancelAnimationFrame(reqanim);
				reqanim = undefined;
				if (board.get_winner() === 1) {
					props.incLeft();
					console.log('left');
				} else {
					props.incRight();
					console.log('right');
				}
			}
		}


		const drawPong = () => {
			ctx.beginPath();
			board.draw(ctx, GAME_SETTINGS.ratio);
			ctx.stroke();
		}

		const setup = () => {
			setup_key();
		}

		const start = () => {
			reqanim = true;
			board.reset();
			board.set_ball_dir(-1, 0);
			drawPong();
			renderLoop();
		}


		setup();
		start();


	}
}
