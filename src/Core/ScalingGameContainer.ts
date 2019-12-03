import * as PIXI from 'pixi.js';
import {GameContainerLayer, GameRenderContainer} from "./GameRenderContainer";
import {Game} from "../Bootstrap/Game";

export enum ContainerUpscaleMode {
	NoScale = 0,
	SnapScale = 1,
	FullScale = 2
}

export class ScalingGameContainer implements GameRenderContainer {
	private _upscaleMode: ContainerUpscaleMode;
	private _lastWindowWidth: number;
	private _lastWindowHeight: number;

	private readonly _game: Game;
	private readonly _layers: PIXI.Container[];
	private readonly _renderedGame: PIXI.Sprite;
	private readonly _mask: PIXI.Graphics;
	private readonly _baseWidth: number;
	private readonly _baseHeight: number;

	private readonly _renderTexture: PIXI.RenderTexture;

	public get upscaleMode(): ContainerUpscaleMode {
		return this._upscaleMode;
	}

	public set upscaleMode(mode: ContainerUpscaleMode) {
		if (this._upscaleMode !== mode) {
			this._upscaleMode = mode;
			this.setWindowDimensions(this._lastWindowWidth, this._lastWindowHeight);
		}
	}

	constructor(game: Game, baseWidth: number, baseHeight: number, scaleMode: number = PIXI.SCALE_MODES.NEAREST, upscaleMode: ContainerUpscaleMode = ContainerUpscaleMode.SnapScale) {
		this._game = game;

		this._mask = new PIXI.Graphics();
		this._renderTexture = PIXI.RenderTexture.create({width: baseWidth, height: baseHeight, scaleMode});
		this._lastWindowWidth = baseWidth;
		this._lastWindowHeight = baseHeight;
		this._upscaleMode = upscaleMode;
		this._baseWidth = baseWidth;
		this._baseHeight = baseHeight;

		this._layers = [];
		this._layers[GameContainerLayer.Normal] = new PIXI.Container();
		this._layers[GameContainerLayer.DebugProportional] = new PIXI.Container();
		this._layers[GameContainerLayer.DebugFullScreen] = new PIXI.Container();
		this._renderedGame = new PIXI.Sprite(this._renderTexture);

		this._renderedGame.mask = this._mask;
		this._renderedGame.interactive = false;
		this._renderedGame.interactiveChildren = false;
		this._layers[GameContainerLayer.DebugProportional].interactive = false;
		this._layers[GameContainerLayer.DebugProportional].interactiveChildren = false;
		this._layers[GameContainerLayer.DebugFullScreen].interactive = false;
		this._layers[GameContainerLayer.DebugFullScreen].interactiveChildren = false;

		this._game.pixi.stage.addChild(this._renderedGame);
		this._layers.forEach(layer => this._game.pixi.stage.addChild(layer));

		// Update visibility after render but before input is parsed
		game.pixi.ticker.add(() => {
			this._layers[GameContainerLayer.Normal].visible = true;
		}, this, PIXI.UPDATE_PRIORITY.LOW - 1);
	}

	public addChild(child: PIXI.DisplayObject, layer: GameContainerLayer): void {
		this._layers[layer].addChild(child);
	}

	public removeChild(child: PIXI.DisplayObject): void {
		this._layers.filter(x => x === child.parent).forEach(x => x.removeChild(child));
	}

	public update(): void {
		this._layers[GameContainerLayer.Normal].filters = this._game.postProcessManager.activeFilters;

		this._layers[GameContainerLayer.Normal].x = 0;
		this._layers[GameContainerLayer.Normal].y = 0;
		this._layers[GameContainerLayer.Normal].scale.x = 1;
		this._layers[GameContainerLayer.Normal].scale.y = 1;
		this._layers[GameContainerLayer.Normal].alpha = 1;

		this._game.pixi.renderer.render(this._layers[GameContainerLayer.Normal], this._renderTexture, true);

		this._layers[GameContainerLayer.Normal].alpha = 0;
		this._layers[GameContainerLayer.Normal].x = this._renderedGame.x;
		this._layers[GameContainerLayer.Normal].y = this._renderedGame.y;
		this._layers[GameContainerLayer.Normal].scale.x = this._renderedGame.scale.x;
		this._layers[GameContainerLayer.Normal].scale.y = this._renderedGame.scale.y;
	}

	public setWindowDimensions(windowWidth: number, windowHeight: number): void {
		this._lastWindowWidth = windowWidth;
		this._lastWindowHeight = windowHeight;

		const [targetWidth, targetHeight] = this.getDimensionsForScaleMode(windowWidth, windowHeight, this._upscaleMode);

		const scaleX = targetWidth / this._baseWidth;
		const scaleY = targetHeight / this._baseHeight;
		const x = (windowWidth - targetWidth) / 2 | 0;
		const y = (windowHeight - targetHeight) / 2 | 0;

		this._renderedGame.x = x;
		this._renderedGame.y = y;
		this._renderedGame.scale.x = scaleX;
		this._renderedGame.scale.y = scaleY;

		this._layers[GameContainerLayer.DebugProportional].x = x;
		this._layers[GameContainerLayer.DebugProportional].y = y;
		this._layers[GameContainerLayer.DebugProportional].scale.x = scaleX;
		this._layers[GameContainerLayer.DebugProportional].scale.y = scaleY;

		this._mask.clear();
		this._mask.lineStyle(0);
		this._mask.beginFill(0, 1);
		this._mask.drawRect(x, y, targetWidth, targetHeight);

		this._game.mouse.scaleProperties.offsetX = x;
		this._game.mouse.scaleProperties.offsetY = y;
		this._game.mouse.scaleProperties.scaleX = scaleX;
		this._game.mouse.scaleProperties.scaleY = scaleY;
	}

	private getDimensionsForScaleMode(windowWidth: number, windowHeight: number, upscaleMode: ContainerUpscaleMode): [number, number] {
		const displayRatio = this._baseWidth / this._baseHeight;

		switch (upscaleMode) {
			case ContainerUpscaleMode.NoScale:
				return [windowWidth, windowHeight];

			case ContainerUpscaleMode.SnapScale:
				const snappedMaxWidth = Math.floor(windowWidth / this._baseWidth) * this._baseWidth;
				const snappedMaxHeight = Math.floor(windowHeight / this._baseHeight) * this._baseHeight;

				if (snappedMaxWidth / snappedMaxHeight < displayRatio) {
					return [
						snappedMaxWidth,
						snappedMaxWidth / displayRatio,
					];
				} else {
					return [
						snappedMaxHeight * displayRatio,
						snappedMaxHeight,
					];
				}

			case ContainerUpscaleMode.FullScale:
				if (windowWidth / windowHeight < displayRatio) {
					return [
						windowWidth,
						windowWidth / displayRatio,
					];
				} else {
					return [
						windowHeight * displayRatio,
						windowHeight,
					];
				}
		}
	}
}