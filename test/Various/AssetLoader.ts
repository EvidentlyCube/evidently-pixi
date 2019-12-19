import 'mocha';
import {assert} from 'chai';
import * as PIXI from 'pixi.js';
import {AssetLoader} from "../../src/Various/AssetLoader";
import {Hashmap} from "../../src/GenericInterfaces";
import {TextureStore} from "../../src/Various/TextureStore";

function endsWith(haystack: string, needle: string): boolean {
	return haystack.length >= needle.length
		&& haystack.substr(haystack.length - needle.length) === needle;
}

class TestLoader {
	public $resources: Hashmap<PIXI.LoaderResource> = {};

	public add(name: string, url: string): void {
		const resource = new (PIXI.LoaderResource as any)(name, url);

		if (endsWith(url, '.png')) {
			resource.texture = new PIXI.Texture(new PIXI.BaseTexture(), new PIXI.Rectangle(0, 0, 1024, 1024));
		}

		this.$resources[name] = resource;
	}

	public load(callback: (...rest: any[]) => void): void {
		callback(this, this.$resources);
	}
}

describe('AssetLoader', () => {
	afterEach(() => {
		PIXI.utils.destroyTextureCache();
	});

	it("Should read textureStore from configuration", async () => {
		const textureStore = new TextureStore();
		const assetLoader = new AssetLoader({textureStore});

		assert.equal(assetLoader.textureStore, textureStore);
	});

	it("Should create its own textureSTore", async () => {
		const assetLoader = new AssetLoader();

		assert.isNotNull(assetLoader.textureStore);
		assert.instanceOf(assetLoader.textureStore, TextureStore);
	});

	it("Should load and register texture", async () => {
		const assetLoader = new AssetLoader();
		assetLoader.queueTexture("testTexture", "testUrl.png");

		const loader = new TestLoader();
		await assetLoader.load(loader as any);

		assert.equal(assetLoader.textureStore.getTexture('testTexture'), loader.$resources['testTexture'].texture);
	});

	it("Should load and register spritesheet", async () => {
		const assetLoader = new AssetLoader();
		assetLoader.queueSheet("testUrl.png", {
			"meta": {
				"image": "atlas.png",
			},
			"frames": {
				"icon_1.png": {
					"frame": {"x": 0, "y": 5, "w": 32, "h": 33},
				},
				"icon_2.png": {
					"frame": {"x": 32, "y": 7, "w": 64, "h": 65},
				},
			},
		});

		const loader = new TestLoader();
		await assetLoader.load(loader as any);

		assert.deepEqual(assetLoader.textureStore.getTexture('icon_1.png').frame, new PIXI.Rectangle(0, 5, 32, 33));
		assert.deepEqual(assetLoader.textureStore.getTexture('icon_2.png').frame, new PIXI.Rectangle(32, 7, 64, 65));
	});

	it("Should load and register spritesheet with prefix", async () => {
		const assetLoader = new AssetLoader();
		assetLoader.queueSheet("testUrl.png", {
			"meta": {
				"image": "atlas.png",
			},
			"frames": {
				"icon_1.png": {
					"frame": {"x": 0, "y": 5, "w": 32, "h": 33},
				},
				"icon_2.png": {
					"frame": {"x": 32, "y": 7, "w": 64, "h": 65},
				},
			},
		}, "sheet1:");

		const loader = new TestLoader();
		await assetLoader.load(loader as any);

		assert.deepEqual(assetLoader.textureStore.getTexture('sheet1:icon_1.png').frame, new PIXI.Rectangle(0, 5, 32, 33));
		assert.deepEqual(assetLoader.textureStore.getTexture('sheet1:icon_2.png').frame, new PIXI.Rectangle(32, 7, 64, 65));
	});

	it("Should load and register tileset", async () => {
		const assetLoader = new AssetLoader();
		assetLoader.queueTexture("testTexture", "testUrl.png");
		assetLoader.queueTileset("testTexture", {
			tileWidth: 10,
			tileHeight: 11,
			spacingX: 2,
			spacingY: 3,
			offsetX: 1,
			offsetY: 4
		});

		const loader = new TestLoader();
		await assetLoader.load(loader as any);

		assert.deepEqual(assetLoader.textureStore.getTile('testTexture', 0, 0).frame, new PIXI.Rectangle(1, 4, 10, 11));
		assert.deepEqual(assetLoader.textureStore.getTile('testTexture', 1, 0).frame, new PIXI.Rectangle(13, 4, 10, 11));
		assert.deepEqual(assetLoader.textureStore.getTile('testTexture', 0, 1).frame, new PIXI.Rectangle(1, 18, 10, 11));
		assert.deepEqual(assetLoader.textureStore.getTile('testTexture', 1, 1).frame, new PIXI.Rectangle(13, 18, 10, 11));
	});

	it("Should load a pixi auto font", async () => {
		const assetLoader = new AssetLoader();
		assetLoader.queuePixiAutoFont("testTexture", "font.fnt");

		const loader = new TestLoader();
		await assetLoader.load(loader as any);

		assert.isNotNull(loader.$resources.testTexture);
		assert.equal(loader.$resources.testTexture.url, 'font.fnt');
		assert.throw(() => assetLoader.textureStore.getTexture('testTexture'));
	});
});
