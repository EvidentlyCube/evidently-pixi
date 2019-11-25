declare namespace PIXI {
	interface RendererOptions {
		/**
		 * the width of the renderers view [default=800]
		 */
		width?: number;

		/**
		 * the height of the renderers view [default=600]
		 */
		height?: number;

		/**
		 * the canvas to use as a view, optional
		 */
		view?: HTMLCanvasElement;

		/**
		 * If the render view is transparent, [default=false]
		 */
		transparent?: boolean;

		/**
		 * sets antialias (only applicable in chrome at the moment) [default=false]
		 */
		antialias?: boolean;

		/**
		 * enables drawing buffer preservation, enable this if you need to call toDataUrl on the webgl context [default=false]
		 */
		preserveDrawingBuffer?: boolean;

		/**
		 * The resolution / device pixel ratio of the renderer, retina would be 2 [default=1]
		 */
		resolution?: number;

		/**
		 * prevents selection of WebGL renderer, even if such is present [default=false]
		 */
		forceCanvas?: boolean;

		/**
		 * The background color of the rendered area (shown if not transparent) [default=0x000000]
		 */
		backgroundColor?: number;

		/**
		 * This sets if the renderer will clear the canvas or not before the new render pass. [default=true]
		 */
		clearBeforeRender?: boolean;

		/**
		 * If true Pixi will Math.floor() x/ y values when rendering, stopping pixel interpolation. [default=false]
		 */
		roundPixels?: boolean;

		/**
		 * forces FXAA antialiasing to be used over native FXAA is faster, but may not always look as great ** webgl only** [default=false]
		 */
		forceFXAA?: boolean;

		/**
		 * `true` to ensure compatibility with older / less advanced devices. If you experience unexplained flickering try setting this to true. **webgl only** [default=false]
		 */
		legacy?: boolean;

		/**
		 * Deprecated
		 */
		context?: WebGLRenderingContext;

		/**
		 * @deprecated
		 */
		autoResize?: boolean;

		/**
		 * Parameter passed to webgl context, set to "high-performance" for devices with dual graphics card
		 */
		powerPreference?: "high-performance";
	}
	interface ApplicationOptions extends RendererOptions {
		/**
		 * `true` to use PIXI.ticker.shared, `false` to create new ticker. [default=false]
		 */
		sharedTicker?: boolean;

		/**
		 * `true` to use PIXI.loaders.shared, `false` to create new Loader.
		 */
		sharedLoader?: boolean;

		/**
		 * automatically starts the rendering after the construction.
		 * Note that setting this parameter to false does NOT stop the shared ticker even if you set
		 * options.sharedTicker to true in case that it is already started. Stop it by your own.
		 */
		autoStart?: boolean;
	}
}