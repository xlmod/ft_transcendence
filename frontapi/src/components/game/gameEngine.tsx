import {game_socket} from "../../socket";
import { BASE_WIDTH} from "./gameTypes/base";
import { Board } from "./gameTypes/Board"
import {GAME_SETTINGS} from "./gameTypes/GameSettings";
/*
export function GameEngine(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d');
	if (ctx) {
		
		var reqanim: any = true;
		GAME_SETTINGS.ratio = ((canvas.width / BASE_WIDTH));

/*
		const renderLoop = () => {
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


		game_socket.socket.on('start', () => {
			console.log('start');
			setup();
			start();
		});
		game_socket.socket.emit('ready');
		game_socket.socket.emit('echo', "READY");

	}
}


const renderLoop = (ctx: CanvasRenderingContext2D, board: Board, reqanim: any) => {
	ctx.beginPath();
	board.draw(ctx, GAME_SETTINGS.ratio);
	ctx.stroke();
	
	if (reqanim)
		reqanim = requestAnimationFrame(renderLoop);
}
*/
