
import {BASE_BALL_SIZE, BASE_BALL_SPEED, BASE_HEIGHT} from "./base";
import {GAME_SETTINGS} from "./GameSettings";
import {Paddle} from "./Paddle";
import { Vec } from "./Vec";

export class Ball {

	private pos: Vec;
	private dir: Vec;
	private size: number;
	private speed: number;

	public constructor(posx: number, posy: number, dirx: number, diry: number) {
		this.pos = new Vec(posx, posy);
		this.dir = new Vec(dirx, diry);
		this.size = BASE_BALL_SIZE;
		this.speed = BASE_BALL_SPEED;
	}

	public copy(): Ball {
		const ball = new Ball(this.pos.x, this.pos.y, this.dir.x, this.dir.y);
		ball.size = this.size;
		ball.speed = this.speed;
		return ball;
	}


	public set_dir(x: number, y: number) {
		this.dir.x = x;
		this.dir.y = y;
	}

	public get_dir() {
		return this.dir;
	}

	public set_pos(x: number, y: number) {
		this.pos = new Vec(x, y);
	}

	public get_pos() {
		return this.pos;
	}

	public set_size(s: number) {
		this.size = s;
	}

	public get_size() {
		return this.size;
	}

	private collision_paddle_left(left: Paddle, nextpos: Vec): any {
		const leftpos: Vec = left.get_pos();
		if (nextpos.x <= leftpos.x && this.pos.x > leftpos.x) {
			const leftsize: Vec = left.get_size();
			const m: number = (this.pos.y - nextpos.y) / (this.pos.x - nextpos.x);
			const b: number = nextpos.y - m * nextpos.x;
			const inter: Vec = new Vec(leftpos.x, m * leftpos.x + b);
			if (inter.y > leftpos.y - leftsize.y && inter.y < leftpos.y + leftsize.y) {
				this.dir.x *= -1;
				this.dir.y = (inter.y - leftpos.y) / leftsize.y;
				return inter;
			}
		}
	}

	private collision_paddle_right(right: Paddle, nextpos: Vec): any {
		const rightpos: Vec = right.get_pos();
		if (nextpos.x >= rightpos.x && this.pos.x < rightpos.x) {
			const rightsize: Vec = right.get_size();
			const m: number = (this.pos.y - nextpos.y) / (this.pos.x - nextpos.x);
			const b: number = nextpos.y - m * nextpos.x;
			const inter: Vec = new Vec(rightpos.x, m * rightpos.x + b);
			if (inter.y > rightpos.y - rightsize.y && inter.y < rightpos.y + rightsize.y) {
				this.dir.x *= -1;
				this.dir.y = (inter.y - rightpos.y) / rightsize.y;
				return inter;
			}
		}
	}

	private collision_wall(nextpos: Vec): any {
		if (nextpos.y <= 0 || nextpos.y >= BASE_HEIGHT) {
			this.dir.y *= -1;
		} else {
			return undefined;
		}
	}

	public move(left: Paddle, right: Paddle) {
		const nextpos: Vec = this.dir.mul(this.speed).add_vec(this.pos);
		if (this.collision_paddle_left(left, nextpos) !== undefined)
			this.apply_modifier(left);
		else if (this.collision_paddle_right(right, nextpos) !== undefined)
			this.apply_modifier(right);
		else if (this.collision_wall(nextpos) === undefined)
			this.pos = nextpos;
	}

	public apply_modifier(paddle: Paddle) {
		const reduce: number | undefined = GAME_SETTINGS.get_modifier("reduce");
		if (reduce !== undefined)
			paddle.reduce(reduce);

		const accelerate_ball: number | undefined = GAME_SETTINGS.get_modifier("accelerate_ball");
		if (accelerate_ball !== undefined)
			this.speed += accelerate_ball;

		const accelerate_paddle: number | undefined = GAME_SETTINGS.get_modifier("accelerate_paddle");
		if (accelerate_paddle !== undefined)
			paddle.add_speed(accelerate_paddle);
	}

	public draw(ctx: CanvasRenderingContext2D, ratio: number) {
		ctx.fillRect(
			(this.pos.x - this.size) * ratio,
			(this.pos.y - this.size) * ratio,
			this.size * 2 * ratio,
			this.size * 2 * ratio
		);
	}

}
