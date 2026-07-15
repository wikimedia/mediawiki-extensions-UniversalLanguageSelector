'use strict';

// Patch the shared vue module instance: MediaWiki provides createMwApp
const Vue = require( 'vue' );
Vue.createMwApp = Vue.createMwApp || Vue.createApp;

const { mockApiGet, setMobileMode } = require( './mocks/uls-test-helpers.js' );

// Restore the default API response before each test: mw.Api().get always
// returns a thenable, and per-test mockResolvedValue overrides do not leak
// into the next test (clearMocks only clears calls, not implementations).
beforeEach( () => {
	mockApiGet.mockReset();
	mockApiGet.mockResolvedValue( {} );
} );

// Mock useFloating to avoid layout engine in JSDOM hanging
jest.mock( '../../resources/ext.uls.rewrite/dist/floating-ui.js', () => {
	const { ref } = require( 'vue' );
	return {
		useFloating: () => ( {
			floatingStyles: ref( {} ),
			isPositioned: ref( true )
		} ),
		offset: jest.fn(),
		flip: jest.fn(),
		shift: jest.fn(),
		autoUpdate: jest.fn()
	};
} );

// Keep Codex real except CdxSearchInput: the real one autofocuses and
// measures layout, which JSDOM cannot handle, and shallowMount's default
// stub lacks the focus() method the ULS view calls after opening.
jest.mock( '@wikimedia/codex', () => {
	const { defineComponent: localDefineComponent } = require( 'vue' );
	return {
		...jest.requireActual( '@wikimedia/codex' ),
		CdxSearchInput: localDefineComponent( {
			name: 'CdxSearchInput',
			props: [ 'modelValue' ],
			emits: [ 'update:modelValue' ],
			template: '<input :value="modelValue" @input="$emit( \'update:modelValue\', $event.target.value )" />',
			methods: {
				focus() {}
			}
		} )
	};
} );

// Setup global mw object and $.uls mock
global.mw = {
	requestIdleCallback: jest.fn( ( callback ) => callback() ),
	Api: jest.fn().mockImplementation( () => ( {
		get: mockApiGet
	} ) ),
	msg: jest.fn( ( key ) => key ),
	message: jest.fn( ( key ) => ( {
		text: () => key,
		parse: () => key
	} ) ),
	log: { error: jest.fn() },
	config: {
		// Per-key defaults; add new keys here as the code under test grows.
		// Unknown keys return null like the real mw.config, so a missing
		// entry fails loudly instead of silently passing a truthy string.
		get: jest.fn( ( key ) => {
			const defaults = {
				wgUserLanguage: 'en',
				wgContentLanguage: 'en',
				wgULSAcceptLanguageList: []
			};
			return key in defaults ? defaults[ key ] : null;
		} )
	},
	user: {
		isNamed: jest.fn().mockReturnValue( false ),
		options: { get: jest.fn() }
	},
	storage: { get: jest.fn(), set: jest.fn() },
	hook: jest.fn( () => ( { add: jest.fn(), fire: jest.fn() } ) ),
	util: {
		wikiScript: jest.fn( ( name ) => `/wiki/${ name }.php` )
	}
};

global.$ = jest.fn( () => ( { data: jest.fn() } ) );
global.$.uls = {
	data: {
		getAutonym: jest.fn( ( code ) => code )
	}
};

// Mock window.matchMedia for JSDOM
Object.defineProperty( window, 'matchMedia', {
	writable: true,
	value: jest.fn()
} );

// Mock scrollIntoView which is missing in JSDOM
Element.prototype.scrollIntoView = jest.fn();

setMobileMode( false );
