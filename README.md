# Evidently Pixi

[![Build Status](https://travis-ci.com/EvidentlyCube/evidently-pixi.svg?branch=master)](https://travis-ci.com/EvidentlyCube/evidently-pixi)

A collection of modules and classes that make it easier to create games in [Pixi.js](https://www.pixijs.com/). If you're interested in using this as a full bootstrap for your game (an example game built using this library is [here](https://github.com/EvidentlyCube/chronic-temporal)) scroll down to "How to use" section. If you're more interested in using some of the classes present here, below is a list of all the modules available:

 * **Bootstrap** - Contains the `Game` class that bootstraps the whole application using other modules.
   * **Game** - Initializes everything, helps load assets, gives access to keyboard/mouse input, exposes scene manager, texture store and others.
 * **Stages** - A stage (do not confuse with Pixi's stage property) is an object which holds all of the display tree of your game and allows you to post-process it in some way.
   * **ChangeViewportStage** - This is a stage which just changes the viewport of pixi to match the containing canvas' dimensions. In other words the canvas dimensions directly correlate with how much space is available.
   * **ScalingStage** - This is a stage that forces the game to always be in a specific resolution, which is stored in a render target, which then can be scaled up or down. Useful for 8-bit games with pixel-perfect rendering. This also gracefully handles Mouse input.
 * **Managers** - Classes for managing certain facets of a game's functionality:
   * **SceneManager** - Controls what scene is currently playing and allows switching to a different one.
 * **Various** - Other classes that do not make sense to create a separate module for them:
   * **TextureStore** - Store for all the textures for easy access to a specific full texture, sprite in a sheet, tile in a tileset or an arbitrary fragment of a texture. Useful for serializing and unserializing textures later.
   * **AssetLoader** - Promise-powered upgrade to Pixi's resource loader that allows easily loading, importing and handling all kinds of assets.

## Documentation

The full documentation can be found [here](https://evidentlycube.github.io/evidently-pixi/). 


### Installing

Add it to your project via:

```
npm i --save evidently-pixi
```

### How to use

The core of this package is the `Game` class which aims to integrate all of the pieces together to create an opinionated bootstrap for game development in PIXI. The development using this library looks as follows:

1. Create an instance of `Game` and configure it for your needs.
2. Use `Scenes` to divide your game into thematic sections - a scene can be title screen, actual gameplay, intro, game over screen etc. You're completely free to use as many or as few scenes, or to implement your own solution and use only a single scene to run it.
3. Global access to `Game` is discouraged but nothing stops you from exporting a constant which holds an instance of it, especially if you want easy access to input or texture store.

### Example Game initialization

```
const game = new Game({
    // `document` and `window` are required to be passed to the configuration
    document,
    window,

    // ID of the element where the PIXI's canvas should be added
     gameContainerId: 'game',

    // optional PIXI configuration, at the very least you want to provide width and height
    pixiConfig: {
    	width: 640,
     	height: 360,
    	backgroundColor: 0,
    	antialias: false,
    },

    // Creates and configures a stage which scales the game pixel-perfect, snapping to full integers of scale,
    // ie. x1, x2, x3, for a crisp pixel look. It also handles all of the magic required for Pixi's
    // interactions to work and for `MouseInput` library to report proper position
    stageFactory: (game: Game) => new ScalingStage(
    	game,
    	640,
    	360,
    	PIXI.SCALE_MODES.NEAREST,
    	Config.ScalingStageUpscaleMode,
    ),

    // Queue some assets to be loaded
    onQueueAssets: (game: Game): void {
        game.assetLoader.queuePixiAutoFont('topaz_0.png', FontTopaz8Image);
        game.assetLoader.queuePixiAutoFont('font-topaz', FontTopaz8);
        game.assetLoader.queueTexture(GfxConstants.InitialTileset, InitialTileset);
        game.assetLoader.queueTileset(GfxConstants.InitialTileset, {
        	tileWidth: 16,
        	tileHeight: 16,
        	offsetX: 0,
        	offsetY: 0,
        	spacingX: 0,
        	spacingY: 0,
        })
    },

    // Callback to create the starting scene
    initialSceneFactory: (game) => new IntroScene(game),

    // Called once everything has finished initializing
    onStartGame: () => {
        console.log("Game started");
    },
);

// Actually starts the initialization of the game
game.start();
```

### Low version warning

The library is currently in version <1.0.0. The reason is that I am still likely to be changing things around, mostly just names of classes and configuration variables.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Links

 * [NPM](https://www.npmjs.com/package/evidently-pixi)
 * [Travis-ci](https://travis-ci.com/EvidentlyCube/evidently-pixi)