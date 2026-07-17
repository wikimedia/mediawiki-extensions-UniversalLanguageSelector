'use strict';

const { nextTick } = require( 'vue' );
const { cdxIconSettings } = require( '@wikimedia/codex-icons' );

const MODULES = [ 'ext.uls.displaysettings', 'ext.uls.preferredlanguages' ];

describe( 'LanguageSettingsEntrypoint', () => {
	let EntrypointRegistry;
	const originalJQuery = global.$;

	// The module registers itself at require time, so each test gets fresh
	// module state (registry + prefetched/anchor flags) via resetModules.
	const loadEntrypoint = () => {
		require( '../../resources/ext.uls.rewrite/LanguageSettingsEntrypoint.js' );
	};

	// Minimal jQuery mock covering the calls the handler makes.
	const setupJQueryMock = () => {
		const ulsContainer = { offset: jest.fn( () => ( { top: 42 } ) ) };
		const anchor = {
			appendTo: jest.fn( () => anchor ),
			languagesettings: jest.fn()
		};
		global.$ = jest.fn( ( arg ) => (
			arg === '<div>' ? anchor : { parents: jest.fn( () => ulsContainer ) }
		) );
		return { ulsContainer, anchor };
	};

	beforeEach( () => {
		jest.resetModules();
		mw.loader = {
			load: jest.fn(),
			using: jest.fn().mockResolvedValue()
		};
		EntrypointRegistry = require( '../../resources/ext.uls.rewrite/EntrypointRegistry.js' );
	} );

	afterEach( () => {
		global.$ = originalJQuery;
		delete mw.loader;
	} );

	it( 'registers a quick action for interface and content modes', () => {
		loadEntrypoint();

		const { QUICK_ACTIONS } = EntrypointRegistry.ENTRYPOINT_TYPE;
		const { INTERFACE, CONTENT } = EntrypointRegistry.ULS_MODE;

		[ INTERFACE, CONTENT ].forEach( ( mode ) => {
			const entries = EntrypointRegistry.getRegisteredEntrypoints( QUICK_ACTIONS, mode );
			expect( entries ).toHaveLength( 1 );
			expect( entries[ 0 ].id ).toBe( 'language-settings-quick-action' );
		} );
	} );

	it( 'registers an empty-list entry point for content mode only', () => {
		loadEntrypoint();

		const { EMPTY_LIST } = EntrypointRegistry.ENTRYPOINT_TYPE;
		const { INTERFACE, CONTENT } = EntrypointRegistry.ULS_MODE;

		const contentEntries = EntrypointRegistry.getRegisteredEntrypoints( EMPTY_LIST, CONTENT );
		expect( contentEntries ).toHaveLength( 1 );
		expect( contentEntries[ 0 ].id ).toBe( 'language-settings-empty-list' );

		expect( EntrypointRegistry.getRegisteredEntrypoints( EMPTY_LIST, INTERFACE ) ).toEqual( [] );
	} );

	it( 'shouldShow returns true and prefetches the settings modules once', () => {
		loadEntrypoint();

		const [ entry ] = EntrypointRegistry.getRegisteredEntrypoints(
			EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
			EntrypointRegistry.ULS_MODE.INTERFACE
		);

		expect( entry.shouldShow() ).toBe( true );
		expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		expect( mw.loader.load ).toHaveBeenCalledWith( MODULES );
	} );

	it( 'getConfig returns label, icon and handler', () => {
		loadEntrypoint();

		const [ entry ] = EntrypointRegistry.getRegisteredEntrypoints(
			EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
			EntrypointRegistry.ULS_MODE.INTERFACE
		);
		const config = entry.getConfig();

		expect( config.label ).toBe( 'ext-uls-open-language-settings' );
		expect( config.icon ).toBe( cdxIconSettings );
		expect( typeof config.handler ).toBe( 'function' );
	} );

	it( 'handler loads the modules and opens the dialog above the ULS container', async () => {
		const { anchor } = setupJQueryMock();
		loadEntrypoint();

		const [ entry ] = EntrypointRegistry.getRegisteredEntrypoints(
			EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
			EntrypointRegistry.ULS_MODE.INTERFACE
		);
		entry.getConfig().handler( { target: {} } );
		await nextTick();

		expect( mw.loader.using ).toHaveBeenCalledWith( MODULES );
		expect( anchor.appendTo ).toHaveBeenCalledWith( document.body );
		expect( anchor.languagesettings ).toHaveBeenCalledWith( {
			autoOpen: true,
			onPosition: expect.any( Function )
		} );

		const { onPosition } = anchor.languagesettings.mock.calls[ 0 ][ 0 ];
		expect( onPosition() ).toEqual( {
			top: 42,
			left: '50%',
			transform: 'translateX(-50%)'
		} );
	} );

	it( 'handler reuses the same anchor element across invocations', async () => {
		const { anchor } = setupJQueryMock();
		loadEntrypoint();

		const [ entry ] = EntrypointRegistry.getRegisteredEntrypoints(
			EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
			EntrypointRegistry.ULS_MODE.INTERFACE
		);
		const { handler } = entry.getConfig();

		handler( { target: {} } );
		await nextTick();
		handler( { target: {} } );
		await nextTick();

		const divCalls = global.$.mock.calls.filter( ( [ arg ] ) => arg === '<div>' );
		expect( divCalls ).toHaveLength( 1 );
		expect( anchor.languagesettings ).toHaveBeenCalledTimes( 2 );
	} );
} );
