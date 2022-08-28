import {Ball} from "./Ball";
import {BASE_BALL_POS_X, BASE_BALL_POS_Y, BASE_COLOR_BOARD, BASE_COLOR_FILL, BASE_COLOR_SHADOW, BASE_HEIGHT, BASE_PADDLE_LEFT_POS_X, BASE_PADDLE_LEFT_POS_Y, BASE_PADDLE_RIGHT_POS_X, BASE_PADDLE_RIGHT_POS_Y, BASE_WIDTH} from "./base";
import {Paddle} from "./Paddle";
import {Vec} from "./Vec";


export class Board {

	private left: Paddle;
	private right: Paddle;
	private ball: Ball;
	private winner: number;

	public constructor() {
		this.left = new Paddle(BASE_PADDLE_LEFT_POS_X, BASE_PADDLE_LEFT_POS_Y, 0, 0);
		this.right = new Paddle(BASE_PADDLE_RIGHT_POS_X, BASE_PADDLE_RIGHT_POS_Y, 0, 0);
		this.ball = new Ball(BASE_BALL_POS_X, BASE_BALL_POS_Y, 0, 0);
		this.winner = 0;
	}

	public copy(): Board {
		const board = new Board();
		board.left = this.left.copy();
		board.right = this.right.copy();
		board.ball = this.ball.copy();
		return board;
	}

	public tick(): boolean {
		this.left.move();
		this.right.move();
		this.ball.move(this.left, this.right);
		const ballpos: Vec = this.ball.get_pos();
		if (ballpos.x < 0) {
			this.winner = 2;
			return true;
		} else if (ballpos.x > BASE_WIDTH) {
			this.winner = 1;
			return true;
		}
		return false;
	}

	public set_right_dir(x: number, y: number) {
		this.right.set_dir(x, y);
	}

	public set_right_pos(x: number, y: number) {
		this.right.set_pos(x, y);
	}

	public get_right_pos(): Vec {
		return this.right.get_pos();
	}
	
	public get_right_dir(): Vec {
		return this.right.get_dir();
	}

	public set_left_dir(x: number, y: number) {
		this.left.set_dir(x, y);
	}

	public set_left_pos(x: number, y: number) {
		this.left.set_pos(x, y);
	}

	public get_left_pos(): Vec {
		return this.left.get_pos();
	}

	public get_left_dir(): Vec {
		return this.left.get_dir();
	}

	public set_ball_pos(x: number, y: number) {
		this.ball.set_pos(x, y);
	}

	public set_ball_dir(x: number, y: number) {
		this.ball.set_dir(x, y);
	}

	public get_ball_pos() : Vec {
		return this.ball.get_pos();
	}

	public get_ball_dir() : Vec {
		return this.ball.get_dir();
	}

	public is_won(): boolean {
		return this.winner !== 0;
	}

	public get_winner(): number {
		return this.winner;
	}

	public draw(ctx: CanvasRenderingContext2D | null, ratio: number) {
		if (ctx) {
			ctx.fillStyle = BASE_COLOR_BOARD;
			ctx.fillRect(
				0,
				0,
				BASE_WIDTH * ratio,
				BASE_HEIGHT * ratio
			);
			ctx.shadowColor = BASE_COLOR_SHADOW;
			ctx.shadowBlur = 20;
			ctx.fillStyle = BASE_COLOR_FILL;
			this.left.draw(ctx, ratio);
			this.right.draw(ctx, ratio);
			this.ball.draw(ctx, ratio);
	//		ctx.strokeStyle = BASE_COLOR_FILL;
	//		ctx.lineWidth = 2;
	//		ctx.strokeRect(0, 0, BASE_WIDTH * ratio, BASE_HEIGHT * ratio);
		}
	}

	public reset() {
		this.left = new Paddle(BASE_PADDLE_LEFT_POS_X, BASE_PADDLE_LEFT_POS_Y, 0, 0);
		this.right = new Paddle(BASE_PADDLE_RIGHT_POS_X, BASE_PADDLE_RIGHT_POS_Y, 0, 0);
		this.ball = new Ball(BASE_BALL_POS_X, BASE_BALL_POS_Y, 0, 0);
		this.winner = 0;
	}

}
