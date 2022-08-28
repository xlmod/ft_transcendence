
import {BASE_HEIGHT, BASE_PADDLE_SIZE_X, BASE_PADDLE_SIZE_Y, BASE_PADDLE_SPEED} from "./base"
import { Vec } from "./Vec";

export class Paddle {

	private pos: Vec;
	private dir: Vec;
	private size: Vec;
	private speed: number;

	public constructor(posx: number, posy: number, dirx: number, diry: number) {
		this.pos = new Vec(posx, posy);
		this.dir = new Vec(dirx, diry);
		this.size = new Vec(BASE_PADDLE_SIZE_X, BASE_PADDLE_SIZE_Y);
		this.speed = BASE_PADDLE_SPEED;
	}

	public copy(): Paddle {
		const paddle = new Paddle(this.pos.x, this.pos.y, this.dir.x, this.dir.y);
		paddle.size.x = this.size.x;
		paddle.size.y = this.size.y;
		paddle.speed = this.speed;
		return paddle;
	}

	public set_dir(x: number, y: number) {
		this.dir = new Vec(x, y);
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

	public set_size(x: number, y: number) {
		this.size = new Vec(x, y);
	}

	public get_size() {
		return this.size;
	}

	public reduce(size: number) {
		if (this.size.y > BASE_HEIGHT / 50)
			this.size.y -= size;
	}

	public add_speed(speed: number) {
		this.speed += speed;
	}


	private collision(nextpos: Vec): boolean {
		if (nextpos.y - this.size.y <= 0) {
			this.pos.y = this.size.y;
		} else if (nextpos.y + this.size.y >= BASE_HEIGHT) {
			this.pos.y = BASE_HEIGHT - this.size.y;
		} else {
			return false;
		}
		return true;
	}

	public move() {
		const nextpos: Vec = this.dir.mul(this.speed).add_vec(this.pos);
		if (this.collision(nextpos) === false)
			this.pos = nextpos;
	}


	public draw(ctx: CanvasRenderingContext2D, ratio: number) {
		ctx.fillRect(
			(this.pos.x - this.size.x) * ratio,
			(this.pos.y - this.size.y) * ratio,
			this.size.x * 2 * ratio,
			this.size.y * 2 * ratio
		);
	}

}
