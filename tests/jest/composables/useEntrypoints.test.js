'use strict';

let mountCallback = null;

// Mock vue's onMounted to capture the mount hook callback
jest.mock( 'vue', () => {
	const original = jest.requireActual( 'vue' );
	return Object.assign( {}, original, {
		onMounted: jest.fn( ( cb ) => {
			mountCallback = cb;
		} ),
		nextTick: jest.fn( () => Promise.resolve() )
	} );
} );

describe( 'useEntrypoints', () => {
	let useEntrypoints;
	let EntrypointRegistry;
	let epInterface;
	let epContent;

	beforeEach( () => {
		jest.resetModules();
		useEntrypoints = require( '../../../resources/ext.uls.rewrite/composables/useEntrypoints.js' );
		EntrypointRegistry = require( '../../../resources/ext.uls.rewrite/EntrypointRegistry.js' );

		mountCallback = null;

		epInterface = {
			id: 'ep-interface',
			shouldShow: jest.fn(),
			getConfig: jest.fn()
		};

		epContent = {
			id: 'ep-content',
			shouldShow: jest.fn(),
			getConfig: jest.fn()
		};
	} );

	it( 'wiring the correct entrypoints for interface mode', () => {
		[
			EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
			EntrypointRegistry.ENTRYPOINT_TYPE.EMPTY_LIST,
			EntrypointRegistry.ENTRYPOINT_TYPE.EMPTY_SEARCH
		].forEach( ( type ) => {
			EntrypointRegistry.register(
				type,
				epInterface,
				EntrypointRegistry.ULS_MODE.INTERFACE
			);
		} );

		const {
			quickActionEntrypoints,
			emptyLanguageListEntrypoints,
			emptySearchEntrypoints,
			missingLanguageEntrypoints
		} = useEntrypoints( EntrypointRegistry.ULS_MODE.INTERFACE );

		expect( quickActionEntrypoints ).toEqual( [ epInterface ] );
		expect( emptyLanguageListEntrypoints ).toEqual( [ epInterface ] );
		expect( emptySearchEntrypoints ).toEqual( [ epInterface ] );
		expect( missingLanguageEntrypoints ).toEqual( [] );
	} );

	it( 'wiring the correct entrypoints for content mode', () => {
		Object.values( EntrypointRegistry.ENTRYPOINT_TYPE ).forEach( ( type ) => {
			EntrypointRegistry.register(
				type,
				epContent,
				EntrypointRegistry.ULS_MODE.CONTENT
			);
		} );

		const {
			quickActionEntrypoints,
			emptyLanguageListEntrypoints,
			emptySearchEntrypoints,
			missingLanguageEntrypoints
		} = useEntrypoints( EntrypointRegistry.ULS_MODE.CONTENT );

		expect( quickActionEntrypoints ).toEqual( [ epContent ] );
		expect( emptyLanguageListEntrypoints ).toEqual( [ epContent ] );
		expect( emptySearchEntrypoints ).toEqual( [ epContent ] );
		expect( missingLanguageEntrypoints ).toEqual( [ epContent ] );
	} );

	it( 'locks the EntrypointRegistry when the component mounts', async () => {
		useEntrypoints( EntrypointRegistry.ULS_MODE.INTERFACE );

		// Registry should not be locked initially
		expect( () => {
			EntrypointRegistry.register(
				EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
				epInterface,
				EntrypointRegistry.ULS_MODE.INTERFACE
			);
		} ).not.toThrow();

		// Trigger the captured mount callback that does the lock()
		expect( mountCallback ).toBeDefined();
		await mountCallback();

		// Registry should be locked after mounting and nextTick
		expect( () => {
			EntrypointRegistry.register(
				EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
				epInterface,
				EntrypointRegistry.ULS_MODE.INTERFACE
			);
		} ).toThrow( '[ULS EntrypointRegistry] Too late!' );
	} );
} );
