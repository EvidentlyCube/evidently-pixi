/**
 * Adapted from https://github.com/rstacruz/jsdom-global
 * Make sure this file is registered when running tests by adding this to the command with which you run mocha:
 * -r <path>/hookJsdom.js
 */
const JSDOM = require( 'jsdom' ).JSDOM;

const jsdomOptions = {
	url: 'http://localhost/'
};

const jsdomInstance = new JSDOM( '', jsdomOptions );
const { window } = jsdomInstance;

const setTimeout = global.setTimeout;

Object.getOwnPropertyNames( window )
	.filter( property => !property.startsWith( '_' ) )
	.forEach( key => global[key] = window[key] );

global.window = window;
global.setTimeout = setTimeout;

window.console = global.console;
