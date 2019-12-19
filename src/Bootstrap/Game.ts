import * as PIXI from "pixi.js";
import {AssetLoader} from "../Various/AssetLoader";
import {TextureStore} from "../Various/TextureStore";
import {Scene, SceneManager} from "../Managers/SceneManager";
import {PostProcessEffects} from "../Managers/PostProcessEffects";
import {GameStageLayer, GameStage} from "../Stages/GameStage";
import {KeyboardInput} from "evidently-input/dist/KeyboardInput";
import {MouseInput} from "evidently-input/dist/MouseInput";

/**
 * Configuration for initializing and running the game
 */
export interface GameConfiguration {
	/**
	 * PIXI configuration
	 */
	pixiConfig: PIXI.ApplicationOptions;
	/**
	 * The `document` is required to hook and handle input
	 */
	document: Document;
	/**
	 * The `window` is required to handle window resizing events
	 */
	window: Window;
	/**
	 * ID of the HTML element where PIXI should be put into
	 */
	gameContainerId: string;

	/**
	 * Factory function to create the [[GameStage]] to use for your game
	 * @param {Game} game The instance of the game that's being initialized
	 */
	stageFactory: (game: Game) => GameStage;

	/**
	 * Factory function to create the initial [[Scene]].
	 * @param {Game} game The instance of the game that's being initialized
	 */
	initialSceneFactory: (game: Game) => Scene;

	/**
	 * Allows setting up custom loader screen.
	 * @param {Game} game The instance of the game that's being initialized
	 */
	onSetupLoadingScreen?: (game: Game) => any | void;

	/**
	 * Allows removing the custom loader screen.
	 * @param {Game} game The instance of the game that's being initialized
	 */
	onRemoveLoadingScreen?: (game: Game) => any | void;

	/**
	 * Function to queue assets using Game's `assetLoader` - see [[AssetLoader]] for more details.
	 * @param {Game} game The instance of the game that's being initialized
	 */
	onQueueAssets: (game: Game) => any | void;

	/**
	 * Called after everything has finished initializing.
	 * @param {Game} game The instance of the game that's being initialized
	 */
	onStartGame?: (game: Game) => any | void;
}

/**
 * The bootstrap and entrypoint for a PIXI game. It does the following things in order:
 *  1. Creates a Pixi instance inside the element specified in `config.gameContainerId`.
 *  2. Register mouse and keyboard listeners to grab input.
 *  3. Setups loading screen.
 *  4. Calls a custom callback to allow you to queue all the assets you need for loading.
 *  5. Loads all the queued assets.
 *  6. Removes loading screen.
 *  7. Initializes the first scene (like a screen of your game: main menu, game itself, game over, leaderboards, etc)
 *  8. Connects to the ticker that updates the active scene.
 *  9. Adds all other necessary listeners - changing game dimensions, updating input etc.
 *
 * ### Example configuration
 *
 * ```
 * const game = new Game({
 *     // `document` and `window` are required to be passed to the configuration
 *     document,
 *     window,
 *
 *     // ID of the element where the PIXI's canvas should be added
 *     gameContainerId: 'game',
 *
 *     // optional PIXI configuration, at the very least you want to provide width and height
 *     pixiConfig: {
 *     	width: 640,
 *     	height: 360,
 *     	backgroundColor: 0,
 *     	antialias: false,
 *     },
 *
 *     // Creates and configures a stage which scales the game pixel-perfect, snapping to full integers of scale,
 *     // ie. x1, x2, x3, for a crisp pixel look. It also handles all of the magic required for Pixi's
 *     // interactions to work and for `MouseInput` library to report proper position
 *     stageFactory: (game: Game) => new ScalingStage(
 *     	game,
 *     	640,
 *     	360,
 *     	PIXI.SCALE_MODES.NEAREST,
 *     	Config.ScalingStageUpscaleMode,
 *     ),
 *
 *     // Queue some assets to be loaded
 *     onQueueAssets: (game: Game): void {
 *         game.assetLoader.queuePixiAutoFont('topaz_0.png', FontTopaz8Image);
 *         game.assetLoader.queuePixiAutoFont('font-topaz', FontTopaz8);
 *         game.assetLoader.queueTexture(GfxConstants.InitialTileset, InitialTileset);
 *         game.assetLoader.queueTileset(GfxConstants.InitialTileset, {
 *         	tileWidth: 16,
 *         	tileHeight: 16,
 *         	offsetX: 0,
 *         	offsetY: 0,
 *         	spacingX: 0,
 *         	spacingY: 0,
 *         })
 *     },
 *
 *     // Callback to create the starting scene
 *     initialSceneFactory: (game) => new IntroScene(game),
 *
 *     // Called once everything has finished initializing
 *     onStartGame: () => {
 *         console.log("Game started");
 *     },
 * );
 *
 * // Actually starts the initialization of the game
 * game.start();
 * ```
 */
export class Game {
	private readonly _config: GameConfiguration;

	public readonly pixi: PIXI.Application;
	public readonly document: Document;
	public readonly keyboard: KeyboardInput;
	public readonly mouse: MouseInput;
	public readonly gameStage: GameStage;
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
		this.gameStage = config.stageFactory(this);
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

	/**
	 * Initializes and runs the game.
	 */
	public start(): void {
		Promise.resolve()
			.then(() => (this._config.onSetupLoadingScreen || this.setupDefaultLoadingScreen).call(this, this))
			.then(() => this._config.onQueueAssets(this))
			.then(() => this.loadAssets())
			.then(() => (this._config.onRemoveLoadingScreen || this.removeDefaultLoadingScreen).call(this, this))
			.then(() => this.initializeScene())
			.then(() => this.finalSetup(this))
			.then(() => this._config?.onStartGame(this));
	}

	/**
	 * Cretes a new PIXI.Sprite on the specified layer. This new sprite will be attached to the
	 * [[GameStage]], and can be used to actually display something on the screen.
	 * See [[GameStageLayer]] for more information about the types of layers.
	 * @param {GameStageLayer} layer Layer on which to create the container.
	 * @return {PIXI.Sprite} The sprite created and attached to stage.
	 */
	public createContainer(layer: GameStageLayer = GameStageLayer.Normal): PIXI.Sprite {
		const sprite = new PIXI.Sprite();

		this.gameStage.addChild(sprite, layer);

		return sprite;
	}

	/**
	 * Removes a container previously created by the call to `createContainer` from the stage. Use
	 * it when it's no longer in use, typicall when switching from a [[Scene]].
	 * @param {PIXI.Sprite} container The contianer to remove
	 */
	public removeContainer(container: PIXI.Sprite): void {
		this.gameStage.removeChild(container);
	}

	private update(): void {
		const delta = this.pixi.ticker.elapsedMS;
		this.sceneManager.update(delta);
		this.postProcessManager.update(delta);
		this.gameStage.update(delta);
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
		game.gameStage.setWindowDimensions(width, height);
	}
}