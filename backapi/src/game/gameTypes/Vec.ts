

export class Vec {

	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	copy(): Vec {
		return new Vec(this.x, this.y);
	}

	add_vec(other: Vec) {
		return new Vec(this.x + other.x, this.y + other.y);
	}

	mul(num: number) {
		return new Vec(this.x * num, this.y * num);
	}

}
