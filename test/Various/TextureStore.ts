import 'mocha';
import {assert} from 'chai';
import {TextureStore, TilesetTextureConfig} from "../../src/Various/TextureStore";
import * as PIXI from 'pixi.js';

const testTextureNameNoFrame = 'Test Texture No Frame';
const testTextureNameWithFrame = 'Test Texture WithFrame';
const testTextureNoFrame = new PIXI.Texture(new PIXI.BaseTexture());
const testTextureWithFrame = new PIXI.Texture(new PIXI.BaseTexture(), new PIXI.Rectangle(10, 15, 20, 25));

function compareTextures(given: PIXI.Texture, expected: PIXI.Texture) {
	assert.equal(given.baseTexture, expected.baseTexture);
	assert.equal(given.width, expected.width);
	assert.equal(given.height, expected.height);
	assert.equal(given.frame.x, expected.frame.x);
	assert.equal(given.frame.y, expected.frame.y);
	assert.equal(given.frame.width, expected.frame.width);
	assert.equal(given.frame.height, expected.frame.height);
}

describe('TextureStore', () => {
	describe("Basic functionality", () => {
		it("Should return default separator", () => {
			const factory = new TextureStore();
			assert.equal(factory.separator, '/');
		});

		it("Should throw error when requesting name for texture that does not exist.", () => {
			const factory = new TextureStore();
			assert.throws(() => factory.getTextureName(testTextureNoFrame), Error);
		});

		it("Should return texture name", () => {
			const factory = new TextureStore();
			factory.registerTexture(testTextureNoFrame, testTextureNameNoFrame);
			assert.equal(factory.getTextureName(testTextureNoFrame), testTextureNameNoFrame);
		});

		it("Should error when retrieving a texture that was not registered", () => {
			const factory = new TextureStore();
			assert.throws(() => factory.getTexture(testTextureNameNoFrame), Error);
		});

		it("Should return previously registered texture", () => {
			const factory = new TextureStore();
			assert.throws(() => factory.getTexture(testTextureNameNoFrame), Error);
		});

		it("Should error when retrieving a texture slice that was not registered", () => {
			const factory = new TextureStore();
			assert.throws(() => factory.getTextureRectangle(testTextureNameNoFrame, 1, 2, 3, 4), Error);
		});

		it("Should error when retrieving a texture slice with zero width", () => {
			const factory = new TextureStore();
			factory.registerTexture(testTextureNoFrame, testTextureNameNoFrame);
			assert.throws(() => factory.getTextureRectangle(testTextureNameNoFrame, 1, 2, 0, 4), Error);
		});

		it("Should error when retrieving a texture slice with zero height", () => {
			const factory = new TextureStore();
			factory.registerTexture(testTextureNoFrame, testTextureNameNoFrame);
			assert.throws(() => factory.getTextureRectangle(testTextureNameNoFrame, 1, 2, 3, 0), Error);
		});

		it("Should return slice of texture - base texture has no frame", () => {
			const factory = new TextureStore();
			factory.registerTexture(testTextureNoFrame, testTextureNameNoFrame);
			const slice = factory.getTextureRectangle(testTextureNameNoFrame, 1, 2, 3, 4);

			assert.equal(slice.width, 3);
			assert.equal(slice.height, 4);
			assert.equal(slice.frame.x, 1);
			assert.equal(slice.frame.y, 2);
		});

		it("Should return slice by name - base texture has no frame", () => {
			const factory = new TextureStore();
			factory.registerTexture(testTextureNoFrame, testTextureNameNoFrame);
			const slice = factory.getTextureRectangle(testTextureNameNoFrame, 1, 2, 3, 4);
			const sliceName = factory.getTextureName(slice);
			assert.equal(factory.getTexture(sliceName), slice);
		});

		it("Should return slice of texture - base texture has frame", () => {
			const factory = new TextureStore();
			factory.registerTexture(testTextureWithFrame, testTextureNameWithFrame);
			const slice = factory.getTextureRectangle(testTextureNameWithFrame, 1, 2, 3, 4);

			assert.equal(slice.width, 3);
			assert.equal(slice.height, 4);
			assert.equal(slice.frame.x, testTextureWithFrame.frame.x + 1);
			assert.equal(slice.frame.y, testTextureWithFrame.frame.y + 2);
			assert.equal(slice.frame.width, 3);
			assert.equal(slice.frame.height, 4);
		});

		it("Should return slice by name - base texture has frame", () => {
			const factory = new TextureStore();
			factory.registerTexture(testTextureWithFrame, testTextureNameWithFrame);
			const slice = factory.getTextureRectangle(testTextureNameWithFrame, 1, 2, 3, 4);
			const sliceName = factory.getTextureName(slice);
			assert.equal(factory.getTexture(sliceName), slice);
		});

		it("Should return slice of texture - base texture is slice", () => {
			const factory = new TextureStore();
			factory.registerTexture(testTextureWithFrame, testTextureNameWithFrame);
			const firstSlice = factory.getTextureRectangle(testTextureNameWithFrame, 3, 7, 10, 15);
			const firstSliceName = factory.getTextureName(firstSlice);
			const secondSlice = factory.getTextureRectangle(firstSliceName, 1, 2, 3, 4);

			assert.equal(secondSlice.width, 3);
			assert.equal(secondSlice.height, 4);
			assert.equal(secondSlice.frame.x, testTextureWithFrame.frame.x + 4);
			assert.equal(secondSlice.frame.y, testTextureWithFrame.frame.y + 9);
			assert.equal(secondSlice.frame.width, 3);
			assert.equal(secondSlice.frame.height, 4);
		});

		it("Should return slice by name - base texture has frame", () => {
			const factory = new TextureStore();
			factory.registerTexture(testTextureWithFrame, testTextureNameWithFrame);
			const firstSlice = factory.getTextureRectangle(testTextureNameWithFrame, 3, 7, 10, 15);
			const firstSliceName = factory.getTextureName(firstSlice);
			const secondSlice = factory.getTextureRectangle(firstSliceName, 1, 2, 3, 4);
			const secondSliceName = factory.getTextureName(secondSlice);
			assert.equal(factory.getTexture(secondSliceName), secondSlice);
		});

		it("Should generate texture by name with slice - no frame originally", () => {
			const factory1 = new TextureStore();
			const factory2 = new TextureStore();
			factory1.registerTexture(testTextureNoFrame, testTextureNameNoFrame);
			factory2.registerTexture(testTextureNoFrame, testTextureNameNoFrame);

			const expectedSlice = factory1.getTextureRectangle(testTextureNameNoFrame, 1, 2, 3, 4);
			const expectedSliceName = factory1.getTextureName(expectedSlice);

			compareTextures(factory2.getTexture(expectedSliceName), expectedSlice);
		});

		it("Should generate texture by name with slice - frame originally", () => {
			const factory1 = new TextureStore();
			const factory2 = new TextureStore();
			factory1.registerTexture(testTextureWithFrame, testTextureNameWithFrame);
			factory2.registerTexture(testTextureWithFrame, testTextureNameWithFrame);

			const expectefSlice = factory1.getTextureRectangle(testTextureNameWithFrame, 1, 2, 3, 4);
			const expectedSliceName = factory1.getTextureName(expectefSlice);

			compareTextures(factory2.getTexture(expectedSliceName), expectefSlice);
		});

		it("Should generate texture by name with slice - from slice", () => {
			const factory1 = new TextureStore();
			const factory2 = new TextureStore();
			factory1.registerTexture(testTextureWithFrame, testTextureNameWithFrame);
			factory2.registerTexture(testTextureWithFrame, testTextureNameWithFrame);

			const firstSlice = factory1.getTextureRectangle(testTextureNameWithFrame, 1, 2, 3, 4);
			const firstSliceName = factory1.getTextureName(firstSlice);
			const expectedSlice = factory1.getTextureRectangle(firstSliceName, 1, 2, 3, 4);
			const expectedSliceName = factory1.getTextureName(expectedSlice);

			compareTextures(factory2.getTexture(expectedSliceName), expectedSlice);
		});
	});

	describe('Custom separator', () => {
		it("Should throw error when separator is a string shorter than 1 character", () => {
			assert.throws(() => new TextureStore(''));
		});

		it("Should throw error when separator is a string longer than 1 character", () => {
			assert.throws(() => new TextureStore('~~'));
		});

		['~', '`', ':'].forEach(separator => describe(`Separator is '${separator}'`, () => {
			it("Returns expected separator", () => {
				const factory = new TextureStore(separator);
				assert.equal(factory.separator, separator);
			});

			it("Throws error when registering texture with name that contains the separator", () => {
				const factory = new TextureStore(separator);

				assert.throws(() => factory.registerTexture(testTextureNoFrame, `Name${separator}`));
			});

			it("Should use the separator in texture fragment name", () => {
				const factory = new TextureStore(separator);
				factory.registerTexture(testTextureNoFrame, "test");
				const fragmentTexture = factory.getTextureRectangle("test", 1, 1, 1, 1);
				const fragmentName = factory.getTextureName(fragmentTexture);

				assert.equal(fragmentName, `test${separator}1${separator}1${separator}1${separator}1`);
			});
		}));
	});

	describe('Tilesets', () => {
		const defaultConfig: TilesetTextureConfig = {
			offsetX: 1,
			offsetY: 1,
			spacingX: 1,
			spacingY: 1,
			tileWidth: 1,
			tileHeight: 1,
		};

		it("Should error when registering tileset config for not registered texture", () => {
			const factory = new TextureStore();
			assert.throws(() => factory.registerTileset(testTextureNameNoFrame, defaultConfig), Error);
		});

		it("Should error when registering tileset config again", () => {
			const factory = new TextureStore();
			factory.registerTexture(testTextureNoFrame, testTextureNameNoFrame);
			factory.registerTileset(testTextureNameNoFrame, defaultConfig);
			assert.throws(() => factory.registerTileset(testTextureNameNoFrame, defaultConfig), Error);
		});

		it("Should error when fetching tile for non-tileset", () => {
			const factory = new TextureStore();
			factory.registerTexture(testTextureNoFrame, testTextureNameNoFrame);

			assert.throws(() => factory.getTile(testTextureNameNoFrame, 0, 0), Error);
		});

		describe("Incorrect config", () => {
			type ConfigKey = Extract<keyof TilesetTextureConfig, string>;
			const minZeroFields: ConfigKey[] = ['offsetX', 'offsetY', 'spacingX', 'spacingY'];
			const minOneFields: ConfigKey[] = ['tileWidth', 'tileHeight'];
			minZeroFields.forEach(field => {
				it(`Should error when registering tileset with negative ${field}`, () => {
					const config = {...defaultConfig};
					config[field] = -1;

					const factory = new TextureStore();
					factory.registerTexture(testTextureNoFrame, testTextureNameNoFrame);
					assert.throws(() => factory.registerTileset(testTextureNameNoFrame, config), Error);
				});
			});

			minOneFields.forEach(field => {
				it(`Should error when registering tileset with zero ${field}`, () => {
					const config = {...defaultConfig};
					config[field] = 0;

					const factory = new TextureStore();
					factory.registerTexture(testTextureNoFrame, testTextureNameNoFrame);
					assert.throws(() => factory.registerTileset(testTextureNameNoFrame, config), Error);
				});
			});
		});

		describe("Creating tiles", () => {
			const tileEdges = [8, 16];
			const offsets = [0, 1];
			const spacings = [0, 2];
			const tilePositions = [0, 3];

			interface TestCase {
				width: number;
				height: number;
				offsetX: number;
				offsetY: number;
				spacingX: number;
				spacingY: number;
				tileX: number;
				tileY: number;
			}

			const testCases: TestCase[] = [];
			tileEdges.forEach(width => {
				tileEdges.forEach(height => {
					offsets.forEach(offsetX => {
						offsets.forEach(offsetY => {
							spacings.forEach(spacingX => {
								spacings.forEach(spacingY => {
									tilePositions.forEach(tileX => {
										tilePositions.forEach(tileY => {
											testCases.push({width, height, offsetX, offsetY, spacingX: spacingX, spacingY: spacingY, tileX, tileY});
										});
									});
								});
							});
						});
					});
				});
			});

			testCases.forEach(testCase => {
				it("Test case (no frame) " + JSON.stringify(testCase), () => {
					const factory = new TextureStore();
					factory.registerTexture(testTextureNoFrame, testTextureNameNoFrame);
					factory.registerTileset(testTextureNameNoFrame, {
						offsetX: testCase.offsetX,
						offsetY: testCase.offsetY,
						spacingX: testCase.spacingX,
						spacingY: testCase.spacingY,
						tileWidth: testCase.width,
						tileHeight: testCase.height,
					});

					const expectedX = testCase.offsetX + testCase.tileX * (testCase.width + testCase.spacingX);
					const expectedY = testCase.offsetY + testCase.tileY * (testCase.height + testCase.spacingY);
					const tileTexture = factory.getTile(testTextureNameNoFrame, testCase.tileX, testCase.tileY);

					assert.equal(tileTexture.frame.x, expectedX);
					assert.equal(tileTexture.frame.y, expectedY);
					assert.equal(tileTexture.frame.width, testCase.width);
					assert.equal(tileTexture.frame.height, testCase.height);
				});
			});

			testCases.forEach(testCase => {
				it("Test case (with frame) " + JSON.stringify(testCase), () => {
					const factory = new TextureStore();
					factory.registerTexture(testTextureWithFrame, testTextureNameWithFrame);
					factory.registerTileset(testTextureNameWithFrame, {
						offsetX: testCase.offsetX,
						offsetY: testCase.offsetY,
						spacingX: testCase.spacingX,
						spacingY: testCase.spacingY,
						tileWidth: testCase.width,
						tileHeight: testCase.height,
					});

					const expectedX = testCase.offsetX + testCase.tileX * (testCase.width + testCase.spacingX) + testTextureWithFrame.frame.x;
					const expectedY = testCase.offsetY + testCase.tileY * (testCase.height + testCase.spacingY) + testTextureWithFrame.frame.y;
					const tileTexture = factory.getTile(testTextureNameWithFrame, testCase.tileX, testCase.tileY);

					assert.equal(tileTexture.frame.x, expectedX);
					assert.equal(tileTexture.frame.y, expectedY);
					assert.equal(tileTexture.frame.width, testCase.width);
					assert.equal(tileTexture.frame.height, testCase.height);
				});
			});
		});
	});
});
