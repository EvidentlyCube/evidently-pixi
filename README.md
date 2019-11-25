# Evidently Pixi

[![Build Status](https://travis-ci.com/EvidentlyCube/evidently-pixi.svg?branch=master)](https://travis-ci.com/EvidentlyCube/evidently-pixi)

A collection of modules and classes that make it easier to create games in [Pixi.js](https://www.pixijs.com/). The modules are:

 * **Bootstrap** - Contains the `Game` class that bootstraps the whole application using other modules.
 * **Various** - Other classes that do not make sense to create a separate module for them:
   * **TextureStore** - Store for all the textures for easy access to a specific full texture, sprite in a sheet, tile in a tileset or an arbitrary fragment of a texture. Useful for serializing and unserializing textures later.
   * **AssetLoader** - Promise-powered upgrade to Pixi's resource loader that allows easily loading, importing and handling all kinds of assets.

## Getting Started

This library was written in TypeScript but will also work in projects written in JavaScript.

### Installing

Add it to your project via:

```
npm i --save evidently-pixi
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Links

 * [NPM](https://www.npmjs.com/package/evidently-pixi)
 * [Travis-ci](https://travis-ci.com/EvidentlyCube/evidently-pixi)