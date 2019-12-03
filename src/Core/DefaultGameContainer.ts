import * as PIXI from "pixi.js";
import {GameContainerLayer, GameRenderContainer} from "./GameRenderContainer";
import {Game} from "../Bootstrap/Game";

export class DefaultGameContainer implements GameRenderContainer{

	private readonly _game: Game;

	private readonly _layers: PIXI.Container[];

	constructor(game: Game) {
		this._game = game;

		this._layers = [];
		this._layers[GameContainerLayer.Normal] = new PIXI.Container();
		this._layers[GameContainerLayer.DebugProportional] = new PIXI.Container();
		this._layers[GameContainerLayer.DebugFullScreen] = new PIXI.Container();

		this._layers.forEach(layer => game.pixi.stage.addChild(layer));
	}

	public update(): void {
		this._layers[GameContainerLayer.Normal].filters = this._game.postProcessManager.activeFilters;
	}

	public addChild(child: PIXI.DisplayObject, layer: GameContainerLayer): void {
		this._layers[layer].addChild(child);
	}

	public removeChild(child: PIXI.DisplayObject): void {
		this._layers.filter(x => x === child.parent).forEach(x => x.removeChild(child));
	}

	public setWindowDimensions(): void {
		// Do nothing
	}
}