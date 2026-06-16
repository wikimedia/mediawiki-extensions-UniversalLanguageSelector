'use strict';

describe( 'EntrypointRegistry', () => {
	let EntrypointRegistry;
	let validEntryPoint;

	beforeEach( () => {
		jest.resetModules();
		EntrypointRegistry = require( '../../resources/ext.uls.rewrite/EntrypointRegistry.js' );

		validEntryPoint = {
			id: 'test-action',
			shouldShow: jest.fn(),
			getConfig: jest.fn()
		};
	} );

	it( 'registers and retrieves a valid entry point successfully', () => {
		const type = EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS;
		const mode = EntrypointRegistry.ULS_MODE.INTERFACE;

		EntrypointRegistry.register( type, validEntryPoint, mode );

		const entries = EntrypointRegistry.getRegisteredEntrypoints( type, mode );
		expect( entries ).toHaveLength( 1 );
		expect( entries[ 0 ] ).toBe( validEntryPoint );
	} );

	it( 'throws an error if registry is locked', () => {
		EntrypointRegistry.lock();

		expect( () => {
			EntrypointRegistry.register(
				EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
				validEntryPoint,
				EntrypointRegistry.ULS_MODE.INTERFACE
			);
		} ).toThrow( '[ULS EntrypointRegistry] Too late!' );
	} );

	it( 'throws an error if no mode is specified', () => {
		expect( () => {
			EntrypointRegistry.register(
				EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
				validEntryPoint,
				[]
			);
		} ).toThrow( '[ULS EntrypointRegistry] ID: "test-action" must specify mode' );

		expect( () => {
			EntrypointRegistry.register(
				EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
				validEntryPoint,
				null
			);
		} ).toThrow( '[ULS EntrypointRegistry] ID: "test-action" must specify mode' );
	} );

	it( 'throws an error if entry point id is missing or invalid', () => {
		const invalidEntryPoint = {
			shouldShow: jest.fn(),
			getConfig: jest.fn()
		};

		expect( () => {
			EntrypointRegistry.register(
				EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
				invalidEntryPoint,
				EntrypointRegistry.ULS_MODE.INTERFACE
			);
		} ).toThrow( "missing valid 'id'" );
	} );

	it( 'throws an error if shouldShow or getConfig are not functions', () => {
		const invalidEntryPoint = {
			id: 'invalid-fns',
			shouldShow: 'not-a-fn',
			getConfig: jest.fn()
		};

		expect( () => {
			EntrypointRegistry.register(
				EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
				invalidEntryPoint,
				EntrypointRegistry.ULS_MODE.INTERFACE
			);
		} ).toThrow( "must have 'shouldShow' and 'getConfig' methods" );
	} );

	it( 'throws an error for invalid entry point types', () => {
		expect( () => {
			EntrypointRegistry.register(
				'invalid-type',
				validEntryPoint,
				EntrypointRegistry.ULS_MODE.INTERFACE
			);
		} ).toThrow( 'Invalid entrypoint type' );
	} );

	it( 'supports only content mode for MISSING_CONTENT_LANGUAGES type', () => {
		// Valid content mode registration
		expect( () => {
			EntrypointRegistry.register(
				EntrypointRegistry.ENTRYPOINT_TYPE.MISSING_CONTENT_LANGUAGES,
				validEntryPoint,
				EntrypointRegistry.ULS_MODE.CONTENT
			);
		} ).not.toThrow();

		// Invalid interface mode registration
		expect( () => {
			EntrypointRegistry.register(
				EntrypointRegistry.ENTRYPOINT_TYPE.MISSING_CONTENT_LANGUAGES,
				validEntryPoint,
				EntrypointRegistry.ULS_MODE.INTERFACE
			);
		} ).toThrow( 'Mode "interface" not supported' );
	} );

	it( 'supports all modes for QUICK_ACTIONS, EMPTY_SEARCH, and EMPTY_LIST types', () => {
		const nonRestrictedTypes = Object.values( EntrypointRegistry.ENTRYPOINT_TYPE ).filter(
			( type ) => type !== EntrypointRegistry.ENTRYPOINT_TYPE.MISSING_CONTENT_LANGUAGES
		);
		const modes = Object.values( EntrypointRegistry.ULS_MODE );

		nonRestrictedTypes.forEach( ( type ) => {
			modes.forEach( ( mode ) => {
				const ep = {
					id: `ep-${ type }-${ mode }`,
					shouldShow: jest.fn(),
					getConfig: jest.fn()
				};
				expect( () => {
					EntrypointRegistry.register( type, ep, mode );
				} ).not.toThrow();

				const registered = EntrypointRegistry.getRegisteredEntrypoints( type, mode );
				expect( registered ).toContain( ep );
			} );
		} );
	} );

	it( 'returns an empty array for unknown types or modes', () => {
		const entries1 = EntrypointRegistry.getRegisteredEntrypoints( 'non-existent', 'content' );
		const entries2 = EntrypointRegistry.getRegisteredEntrypoints(
			EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
			'non-existent-mode'
		);

		expect( entries1 ).toEqual( [] );
		expect( entries2 ).toEqual( [] );
	} );
} );
