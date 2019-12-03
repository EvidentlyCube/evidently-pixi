import 'mocha';
import {assert} from 'chai';

import {Scene, SceneManager} from "../../src/Managers/SceneManager";

describe('SceneManager', () => {
	it('update() - Should do nothing when no scene', () => {
		const manager = new SceneManager();

		assert.doesNotThrow(() => manager.update(1));
	});

	it('update() - Should pass the passedTime to the update method of the scene', () => {
		let calledUpdate = false;

		const scene: Scene = {
			onEnded(): void {},
			onStarted(): void {},
			update(passedTime: number): void {
				calledUpdate = true;
				assert.equal(passedTime, 123);
			}
		};
		const manager = new SceneManager();
		manager.changeScene(scene);

		manager.update(123);
		assert.equal(calledUpdate, true);
	});

	it('update() - Should pass the passedTime to the update method of the scene', () => {
		let calledUpdate = false;

		const scene: Scene = {
			onEnded(): void {},
			onStarted(): void {},
			update(passedTime: number): void {
				calledUpdate = true;
				assert.equal(passedTime, 123);
			}
		};

		const manager = new SceneManager();
		manager.changeScene(scene);

		manager.update(123);
		assert.equal(calledUpdate, true);
	});

	it('changeScene() - should call onStarted() on the new scene', () => {
		let onStartedCalled = false;
		const scene: Scene = {
			onEnded(): void {},
			onStarted(): void {
				onStartedCalled = true;
			},
			update(): void {}
		};

		const manager = new SceneManager();
		manager.changeScene(scene);
		assert.equal(onStartedCalled, true);
	});

	it('changeScene() - should call onEnded() on the old scene', () => {
		let onEndedCalled = false;
		const sceneOld: Scene = {
			onEnded(): void {
				onEndedCalled = true;
			},
			onStarted(): void {},
			update(): void {}
		};
		const sceneNew: Scene = {
			onEnded(): void {},
			onStarted(): void {},
			update(): void {}
		};

		const manager = new SceneManager();
		manager.changeScene(sceneOld);
		manager.changeScene(sceneNew);
		assert.equal(onEndedCalled, true);
	});
});
