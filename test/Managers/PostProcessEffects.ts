import 'mocha';
import * as PIXI from 'pixi.js';
import {assert} from 'chai';
import {PostProcessEffect, PostProcessEffects} from "../../src/Managers/PostProcessEffects";

class TestEffect implements PostProcessEffect {
	public readonly filter: PIXI.Filter;

	public get isActive(): boolean {
		return this.$isActive;
	}

	public $isActive: boolean;
	public $lastUpdateCallArgument: number | undefined;

	constructor() {
		this.filter = new PIXI.Filter('', '');
		this.$isActive = true;
		this.$lastUpdateCallArgument = undefined;
	}

	public update(passedTime: number): void {
		this.$lastUpdateCallArgument = passedTime;
	}
}

describe('PostProcessEffects', () => {
	it("Should return previously added effects in the order added", () => {
		const effect1 = new TestEffect();
		const effect2 = new TestEffect();
		const effect3 = new TestEffect();

		const effects = new PostProcessEffects();
		effects.addEffect(effect1);
		effects.addEffect(effect2);
		effects.addEffect(effect3);

		assert.lengthOf(effects.activeFilters, 3);
		assert.equal(effects.activeFilters[0], effect1.filter);
		assert.equal(effects.activeFilters[1], effect2.filter);
		assert.equal(effects.activeFilters[2], effect3.filter);
	});

	it("Should exclude inactive effects", () => {
		const effect1 = new TestEffect();
		const effect2 = new TestEffect();
		const effect3 = new TestEffect();

		effect2.$isActive = false;

		const effects = new PostProcessEffects();
		effects.addEffect(effect1);
		effects.addEffect(effect2);
		effects.addEffect(effect3);

		assert.lengthOf(effects.activeFilters, 2);
		assert.equal(effects.activeFilters[0], effect1.filter);
		assert.equal(effects.activeFilters[1], effect3.filter);
	});

	it("Should call update on every effect, even inactive", () => {
		const effect1 = new TestEffect();
		const effect2 = new TestEffect();
		const effect3 = new TestEffect();

		effect2.$isActive = false;

		const effects = new PostProcessEffects();
		effects.addEffect(effect1);
		effects.addEffect(effect2);
		effects.addEffect(effect3);

		effects.update(123);
		assert.equal(effect1.$lastUpdateCallArgument, 123);
		assert.equal(effect2.$lastUpdateCallArgument, 123);
		assert.equal(effect3.$lastUpdateCallArgument, 123);
	});
});
