/**
 * A scene is a container for separating logically-different sections of your game - a title screen, a cutscene player,
 * the actual game, credits screen and so on.
 */
export interface Scene {
	/**
	 * Called every frame.
	 *
	 * @param {number} passedTime The time that passed since the last frame in milliseconds
	 */
	update(passedTime: number): void;

	/**
	 * Runs when this scene is changed to in [[SceneManager]].
	 */
	onStarted(): void;

	/**
	 * Runs when another scene replaces this one in [[SceneManager]].
	 */
	onEnded(): void;
}

/**
 * A class for managing which scene is currently active.
 */
export class SceneManager {
	private _currentScene?: Scene;

	/**
	 * Called every frame, will call `update()` of the current scene.
	 *
	 * @param {number} passedTime The time that passed since the last frame in milliseconds
	 */
	public update(passedTime: number): void {
		this._currentScene?.update(passedTime);
	}

	/**
	 * Changes the scene calling `onEnded()` on the scene that was previously active and `onStarted()` on the new one.
	 *
	 * @param {Scene} newScene The new scene that should replace the old one.
	 */
	public changeScene(newScene: Scene): void {
		this._currentScene?.onEnded();

		this._currentScene = newScene;
		this._currentScene.onStarted();
	}
}