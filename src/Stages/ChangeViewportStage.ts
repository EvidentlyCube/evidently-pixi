import * as PIXI from "pixi.js";
import {GameStageLayer, GameStage} from "./GameStage";
import {Game} from "../Bootstrap/Game";

/**
 * This stage will not scale the display tree in any way, and instead will change available space
 * of the game as the canvas' area changes.
 */
export class ChangeViewportStage implements GameStage {
	private readonly _game: Game;

	private readonly _layers: PIXI.Container[];

	constructor(game: Game) {
		this._game = game;

		this._layers = [];
		this._layers[GameStageLayer.Normal] = new PIXI.Container();
		this._layers[GameStageLayer.DebugProportional] = new PIXI.Container();
		this._layers[GameStageLayer.DebugFullScreen] = new PIXI.Container();

		this._layers.forEach(layer => game.pixi.stage.addChild(layer));
	}

	public update(): void {
		this._layers[GameStageLayer.Normal].filters = this._game.postProcessManager.activeFilters;
	}

	public addChild(child: PIXI.DisplayObject, layer: GameStageLayer): void {
		this._layers[layer].addChild(child);
	}

	public removeChild(child: PIXI.DisplayObject): void {
		this._layers.filter(x => x === child.parent).forEach(x => x.removeChild(child));
	}

	public setWindowDimensions(): void {
		// Do nothing
	}
}