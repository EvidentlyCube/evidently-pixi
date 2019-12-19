/**
 * Type of the layer in a stage
 */
export enum GameStageLayer {
	/**
	 * Used for displaying the game.
	 */
	Normal = 0,
	/**
	 * Used for displaying debug graphics, always renders on top of `Normal`,
	 * but is subject to any scale changes that `Normal` layer is, depending
	 * on the stage used.
	 */
	DebugProportional = 1,
	/**
	 * Used for displaying debug graphics, always renders on top of `DebugProportional`,
	 * and always corresponds 1:1 to the actual physical space of the canvas, regardless
	 * of what changes the stage would do.
	 */
	DebugFullScreen = 2
}

export interface GameStage {
	update(timePassed: number): void;

	addChild(child: PIXI.DisplayObject, layer: GameStageLayer): void;

	removeChild(child: PIXI.DisplayObject): void;

	setWindowDimensions(width: number, height: number): void;
}