export interface PostProcessEffect {
	readonly isActive: boolean;
	readonly filter: PIXI.Filter;

	update(passedTime: number): void;
}

/**
 * Manager for post process effects.
 */
export class PostProcessEffects {
	private readonly _effects: PostProcessEffect[];

	public get activeFilters(): PIXI.Filter[] {
		return this._effects.filter(x => x.isActive).map(x => x.filter);
	}

	constructor() {
		this._effects = [];
	}

	public update(timePassed: number): void {
		this._effects.forEach(effect => effect.update(timePassed));
	}

	public addEffect(effect: PostProcessEffect): void {
		this._effects.push(effect);
	}
}