import * as PIXI from "pixi.js";
import {AssetLoader} from "../Various/AssetLoader";
import {TextureStore} from "../Various/TextureStore";
import {Scene, SceneManager} from "../Managers/SceneManager";
import {PostProcessEffects} from "../Managers/PostProcessEffects";
import {GameContainerLayer, GameRenderContainer} from "../Core/GameRenderContainer";
import {KeyboardInput} from "evidently-input/dist/KeyboardInput";
import {MouseInput} from "evidently-input/dist/MouseInput";

export interface GameConfiguration {
	pixiConfig: PIXI.ApplicationOptions;
	document: Document;
	window: Window;
	gameContainerId: string;

	containerFactory: (game: Game) => GameRenderContainer;

	initialSceneFactory: (game: Game) => Scene;

	onSetupLoadingScreen?: (game: Game) => any | void;
	onRemoveLoadingScreen?: (game: Game) => any | void;
	onQueueAssets: (game: Game) => any | void;
	onStartGame: (game: Game) => any | void;
}

export class Game {
	private readonly _config: GameConfiguration;

	public readonly pixi: PIXI.Application;
	public readonly document: Document;
	public readonly keyboard: KeyboardInput;
	public readonly mouse: MouseInput;
	public readonly gameContainer: GameRenderContainer;
	public readonly assetLoader: AssetLoader;
	public readonly textureStore: TextureStore;
	public readonly sceneManager: SceneManager;
	public readonly postProcessManager: PostProcessEffects;

	public constructor(config: GameConfiguration) {
		if (config.pixiConfig.sharedTicker === undefined) {
			config.pixiConfig.sharedTicker = true;
		}

		this._config = config;

		this.pixi = new PIXI.Application(config.pixiConfig);
		this.document = config.document;
		this.keyboard = new KeyboardInput();
		this.mouse = new MouseInput();
		this.gameContainer = config.containerFactory(this);
		this.textureStore = new TextureStore();
		this.assetLoader = new AssetLoader({textureStore: this.textureStore});
		this.sceneManager = new SceneManager();
		this.postProcessManager = new PostProcessEffects();

		const gameElement = config.document.getElementById(config.gameContainerId);

		if (!gameElement) {
			throw new Error(`Failed to find element '${config.gameContainerId}'`);
		}

		gameElement.appendChild(this.pixi.view);
		this.keyboard.registerListeners(this.document);
		this.mouse.registerListeners(this.document);
	}

	public start(): void {
		Promise.resolve()
			.then(() => (this._config.onSetupLoadingScreen || this.setupDefaultLoadingScreen).call(this, this))
			.then(() => this._config.onQueueAssets(this))
			.then(() => this.loadAssets())
			.then(() => (this._config.onRemoveLoadingScreen || this.removeDefaultLoadingScreen).call(this, this))
			.then(() => this.initializeScene())
			.then(() => this._config.onStartGame(this))
			.then(() => this.finalSetup(this));
	}

	public createLayer(layer: GameContainerLayer = GameContainerLayer.Normal): PIXI.Sprite {
		const sprite = new PIXI.Sprite();

		this.gameContainer.addChild(sprite, layer);

		return sprite;
	}

	public removeLayer(layer: PIXI.Sprite): void {
		this.gameContainer.removeChild(layer);
	}

	private update(): void {
		const delta = this.pixi.ticker.elapsedMS;
		this.sceneManager.update(delta);
		this.postProcessManager.update(delta);
		this.gameContainer.update(delta);
		this.mouse.update();
		this.keyboard.update();
	}

	private setupDefaultLoadingScreen(game: Game): any {
		const div = game.document.createElement('div');
		div.id = "__default-loading-div";
		div.style.position = "fixed";
		div.style.left = "0";
		div.style.right = "0";
		div.style.top = "0";
		div.style.bottom = "0";
		div.style.background = "#444";
		div.style.color = "white";
		div.style.fontSize = "80px";
		div.style.display = "flex";
		div.style.justifyContent = "center";
		div.style.alignContent = "center";
		div.style.alignItems = "center";
		div.textContent = "Loading";

		this.document.getElementsByTagName('body')[0].appendChild(div);
	}

	private removeDefaultLoadingScreen(): any {
		const loadingDiv = this.document.getElementById('__default-loading-div');

		loadingDiv?.parentNode?.removeChild(loadingDiv);
	}

	private loadAssets(): Promise<any> {
		return this.assetLoader.load(this.pixi.loader);
	}

	private initializeScene(): void {
		this.sceneManager.changeScene(this._config.initialSceneFactory(this));
	}

	private finalSetup(game: Game): void {
		game._config.window.onresize = (): void => {
			game.onWindowResize(game, game._config.window.innerWidth, game._config.window.innerHeight);
		};
		game.pixi.ticker.add(() => game.update());

		game.onWindowResize(game, game._config.window.innerWidth, game._config.window.innerHeight);
	}

	private onWindowResize(game: Game, width: number, height: number): void {

		game.pixi.renderer.resize(width, height);
		game.gameContainer.setWindowDimensions(width, height);
	}
}