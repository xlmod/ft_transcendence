import {Ball} from "./Ball";
import {
	BASE_BALL_POS_X,
	BASE_BALL_POS_Y,
	BASE_COLOR_BOARD,
	BASE_COLOR_FILL,
	BASE_COLOR_SHADOW,
	BASE_HEIGHT,
	BASE_PADDLE_LEFT_POS_X,
	BASE_PADDLE_LEFT_POS_Y,
	BASE_PADDLE_RIGHT_POS_X,
	BASE_PADDLE_RIGHT_POS_Y,
	BASE_WIDTH,
} from "./base";
import {GameSettings} from "./GameSettings";
import {Paddle} from "./Paddle";
import {Vec} from "./Vec";


export class Board {

	private left: Paddle;
	private right: Paddle;
	private ball: Ball;
	private winner: number;
	private ctx: CanvasRenderingContext2D | null;
	public setting: GameSettings;

	public constructor() {
		this.left = new Paddle(BASE_PADDLE_LEFT_POS_X, BASE_PADDLE_LEFT_POS_Y, 0, 0);
		this.right = new Paddle(BASE_PADDLE_RIGHT_POS_X, BASE_PADDLE_RIGHT_POS_Y, 0, 0);
		this.ball = new Ball(BASE_BALL_POS_X, BASE_BALL_POS_Y, 0, 0);
		this.winner = 0;
		this.ctx = null;
		this.setting = new GameSettings();
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
		this.ball.move(this.left, this.right, this.setting);
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

	public draw() {
		if (this.ctx) {
			this.ctx.fillStyle = BASE_COLOR_BOARD;
			this.ctx.fillRect(
				0,
				0,
				BASE_WIDTH * this.setting.ratio,
				BASE_HEIGHT * this.setting.ratio
			);
			this.ctx.shadowColor = BASE_COLOR_SHADOW;
			this.ctx.shadowBlur = 20;
			this.ctx.fillStyle = BASE_COLOR_FILL;
			this.left.draw(this.ctx, this.setting.ratio);
			this.right.draw(this.ctx, this.setting.ratio);
			this.ball.draw(this.ctx, this.setting.ratio);
		}
	}

	public clear() {
		if (this.ctx) {
			this.ctx.fillStyle = BASE_COLOR_BOARD;
			this.ctx.fillRect(
				0,
				0,
				BASE_WIDTH * this.setting.ratio,
				BASE_HEIGHT * this.setting.ratio
			);
		}
	}

	public set_ctx(ctx: CanvasRenderingContext2D | null) {
		this.ctx = ctx;
	}

	public set_ratio(ratio: number) {
		this.setting.ratio = ratio;
	}

	public set_speedball(speedball: number) {
		this.setting.add_modifier("accelerate_ball", speedball);
		this.setting.add_modifier("accelerate_paddle", speedball);
	}

	public set_paddleshrink(shrink: number) {
		this.setting.add_modifier("reduce", shrink);
	}

	public reset() {
		this.left = new Paddle(BASE_PADDLE_LEFT_POS_X, BASE_PADDLE_LEFT_POS_Y, 0, 0);
		this.right = new Paddle(BASE_PADDLE_RIGHT_POS_X, BASE_PADDLE_RIGHT_POS_Y, 0, 0);
		this.ball = new Ball(BASE_BALL_POS_X, BASE_BALL_POS_Y, 0, 0);
		this.winner = 0;
		this.setting.remove_modifier("accelerate_ball");
		this.setting.remove_modifier("accelerate_paddle");
		this.setting.remove_modifier("reduce");
	}

}
