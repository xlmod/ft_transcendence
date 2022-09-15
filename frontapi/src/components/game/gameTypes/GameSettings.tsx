
export class GameSettings {

	public ratio: number;
	private _modifier: Map<string, number>;

	public constructor() {
		this.ratio = 1;
		this._modifier = new Map<string, number>();
	}

	public get_modifier(key: string): number | undefined {
		return this._modifier.get(key);
	}

	public add_modifier(key: string, value: number) {
		this._modifier.set(key, value);
	}

	public remove_modifier(key: string) {
		this._modifier.delete(key);
	}

	public clear_modifier() {
		this._modifier.clear();
	}

};

