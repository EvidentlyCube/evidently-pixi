import {Hashmap, ObjectKeymap} from "../GenericInterfaces";
import {TextureStore, TilesetTextureConfig} from "./TextureStore";
import * as PIXI from "pixi.js";
import Resource = PIXI.LoaderResource;

interface PendingTexture {
	name: string;
	imageUrl: string;
}

interface PendingSheet {
	name: string;
	imageUrl: string;
	sheetJson: ObjectKeymap;
	prefix: string;
}

interface PendingTileset {
	name: string;
	config: TilesetTextureConfig;
}

interface AssetLoaderConfiguration {
	textureStore?: TextureStore;
}

/**
 * Upgrade to Pixi's resource loader capable of handling all types of assets commonly used in games and importing them for
 * easy use.
 */
export class AssetLoader {
	private _resources?: Hashmap<Resource>;
	private _wasStarted: boolean;
	private readonly _pendingTextures: PendingTexture[];
	private readonly _pendingSheets: PendingSheet[];
	private readonly _pendingTilesets: PendingTileset[];

	public textureStore: TextureStore;

	constructor(config: AssetLoaderConfiguration = {}) {
		this._wasStarted = false;
		this._pendingTextures = [];
		this._pendingSheets = [];
		this._pendingTilesets = [];
		this.textureStore = config.textureStore || new TextureStore();
	}

	/**
	 * Queues a texture to be loaded and registered in the [[TextureStore]].
	 *
	 * @param {string} name Name by which the texture will be registered in [[TextureStore]].
	 * @param {string} imageUrl URL pointing to the image to load.
	 * @throws {Error} Thrown when loading was already started.
	 */
	public queueTexture(name: string, imageUrl: string): void {
		this.assertNotStarted();

		this._pendingTextures.push({name, imageUrl});
	}

	/**
	 * Queues a spritesheet to be loaded. Every sprite in the sheet will be registered in the [[TextureStore]] with the name
	 * of the sprite, optionally prefixed.
	 *
	 * @param {string} imageUrl URL pointing to the image to load for the spritesheet.
	 * @param {object} sheetJson PIXI.SpriteSheet's format of data
	 * @param {string=""} prefix Optional prefix which is added before every frame's name when loading it into
	 *        [[TextureStore]].
	 * @throws {Error} Thrown when loading was already started.
	 */
	public queueSheet(imageUrl: string, sheetJson: ObjectKeymap, prefix = ""): void {
		this.assertNotStarted();

		this._pendingSheets.push({
			name: `__sheet#${this._pendingSheets.length}`,
			imageUrl, sheetJson, prefix,
		});
	}

	/**
	 * Queues a tileset to be registed in [[TextureStpre]].
	 *
	 * @param {string} name Name of the texture to use as a base for the tileset - it may be a separately loaded texture
	 *        or one of spritesheet's frames.
	 * @param {TilesetTextureConfig} config Tileset configuration.
	 * @throws {Error} Thrown when loading was already started.
	 */
	public queueTileset(name: string, config: TilesetTextureConfig): void {
		this.assertNotStarted();

		this._pendingTilesets.push({
			name: name,
			config: {...config},
		});
	}

	/**
	 * Loads the queued assets and registers them in the appropriate stores.
	 * @param {PIXI.Loader} loader Loader instance to use. In most cases you just want to pass the static PIXI Loader.
	 * @return {Promise<boolean>} A promise that resolves when all of the operations are finishes successfully. Value of the promise will
	 *         always be `true`.
	 * @throws {Error} Thrown when loading was already started.
	 */
	public load(loader: PIXI.Loader): Promise<boolean> {
		this.assertNotStarted();

		this._wasStarted = true;

		this._pendingTextures.forEach(texture => {
			loader.add(texture.name, texture.imageUrl);
		});

		this._pendingSheets.forEach((sheet) => {
			loader.add(sheet.name, sheet.imageUrl);
		});

		const promise = new Promise((resolve) => {
			loader.load((loader: PIXI.Loader, resources: Hashmap<Resource>) => {
				this._resources = resources;
				resolve();
			});
		});

		return promise
			.then(() => this.loadTextures())
			.then(() => this.loadSpritesheets())
			.then(() => this.loadTilesets())
			.then(() => true);
	}

	private loadTextures(): void {
		const resources = this._resources;

		if (!resources) {
			throw new Error('');
		}

		this._pendingTextures.forEach(texture => {
			this.textureStore.registerTexture(resources[texture.name].texture, texture.name);
		});
	}

	private loadSpritesheets(): Promise<any> {
		const resources = this._resources;

		if (!resources) {
			throw new Error('');
		}

		return Promise.all(this._pendingSheets.map(sheet => {
			const resource = resources[sheet.name];
			if (!resource.texture) {
				console.error(resources[sheet.name]);
				throw new Error(`Resource '${sheet.name}' loaded from '${sheet.imageUrl}' expected to be texture but it isn't.`);
			}

			this.textureStore.registerTexture(resource.texture, sheet.name);

			const spritesheet = new PIXI.Spritesheet(
				resource.texture.baseTexture,
				sheet.sheetJson,
			);

			return new Promise((resolve) => {
				spritesheet.parse(() => {
					Object.keys(spritesheet.textures).forEach((textureName) => {
						this.textureStore.registerTexture(spritesheet.textures[textureName], sheet.prefix + textureName);
					});

					resolve();
				});
			});
		}));
	}

	private loadTilesets(): void {
		this._pendingTilesets.forEach(tilesetConfig => {
			this.textureStore.registerTileset(tilesetConfig.name, tilesetConfig.config);
		});
	}

	private assertNotStarted(): void {
		if (this._wasStarted) {
			throw new Error("Asset loader was already started");
		}
	}
}