export enum GameContainerLayer {
	Normal = 0,
	DebugProportional = 1,
	DebugFullScreen = 2
}

export interface GameRenderContainer {
	update(timePassed: number): void;

	addChild(child: PIXI.DisplayObject, layer: GameContainerLayer): void;

	removeChild(child: PIXI.DisplayObject): void;

	setWindowDimensions(width: number, height: number): void;
}