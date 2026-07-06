'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );
const EntrypointRegistry = require( 'ext.uls.rewrite.entrypoints' );
const MissingLanguagesEntrypoint = require( '../../../resources/ext.uls.rewrite/entrypoints/MissingLanguagesEntrypoint.vue' );
const EmptySearchEntrypoint = require( '../../../resources/ext.uls.rewrite/entrypoints/EmptySearchEntrypoint.vue' );
const EmptyListEntrypoint = require( '../../../resources/ext.uls.rewrite/entrypoints/EmptyListEntrypoint.vue' );
const QuickActionTrigger = require( '../../../resources/ext.uls.rewrite/entrypoints/QuickActionTrigger.vue' );

describe( 'UniversalLanguageSelector - mode', () => {
	let wrapper;

	// Register missing languages entry points
	EntrypointRegistry.register(
		EntrypointRegistry.ENTRYPOINT_TYPE.MISSING_CONTENT_LANGUAGES,
		{
			id: 'test-missing-lang',
			shouldShow: () => true,
			getConfig: () => ( { label: 'Missing Lang Action', url: '#' } )
		},
		EntrypointRegistry.ULS_MODE.CONTENT
	);

	// Register empty search entry points for both modes
	EntrypointRegistry.register(
		EntrypointRegistry.ENTRYPOINT_TYPE.EMPTY_SEARCH,
		{
			id: 'test-empty-search-content',
			shouldShow: () => true,
			getConfig: () => ( { label: 'Content Empty Search', handler: () => {} } )
		},
		EntrypointRegistry.ULS_MODE.CONTENT
	);

	EntrypointRegistry.register(
		EntrypointRegistry.ENTRYPOINT_TYPE.EMPTY_SEARCH,
		{
			id: 'test-empty-search-interface',
			shouldShow: () => true,
			getConfig: () => ( { label: 'Interface Empty Search', handler: () => {} } )
		},
		EntrypointRegistry.ULS_MODE.INTERFACE
	);

	// Register empty list entry points for both modes
	EntrypointRegistry.register(
		EntrypointRegistry.ENTRYPOINT_TYPE.EMPTY_LIST,
		{
			id: 'test-empty-list-content',
			shouldShow: () => true,
			getConfig: () => ( { label: 'Content Empty List', handler: () => {} } )
		},
		EntrypointRegistry.ULS_MODE.CONTENT
	);

	EntrypointRegistry.register(
		EntrypointRegistry.ENTRYPOINT_TYPE.EMPTY_LIST,
		{
			id: 'test-empty-list-interface',
			shouldShow: () => true,
			getConfig: () => ( { label: 'Interface Empty List', handler: () => {} } )
		},
		EntrypointRegistry.ULS_MODE.INTERFACE
	);

	// Register quick actions for both modes
	EntrypointRegistry.register(
		EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
		{
			id: 'test-quick-action-content',
			shouldShow: () => true,
			getConfig: () => ( { label: 'Content Quick Action', icon: 'settings' } )
		},
		EntrypointRegistry.ULS_MODE.CONTENT
	);

	EntrypointRegistry.register(
		EntrypointRegistry.ENTRYPOINT_TYPE.QUICK_ACTIONS,
		{
			id: 'test-quick-action-interface',
			shouldShow: () => true,
			getConfig: () => ( { label: 'Interface Quick Action', icon: 'settings' } )
		},
		EntrypointRegistry.ULS_MODE.INTERFACE
	);

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'renders missing languages entrypoint when mode is content', () => {
		wrapper = createWrapper( { mode: 'content' } );
		expect( wrapper.findComponent( MissingLanguagesEntrypoint ).exists() ).toBe( true );
	} );

	it( 'does not render missing languages entrypoint when mode is interface', () => {
		wrapper = createWrapper( { mode: 'interface' } );
		expect( wrapper.findComponent( MissingLanguagesEntrypoint ).exists() ).toBe( false );
	} );

	it( 'renders empty search entrypoint when mode is content and search no results', async () => {
		wrapper = createWrapper( { mode: 'content' } );
		wrapper.vm.searchQueryHits = { en: true };
		wrapper.vm.searchQuery = 'nonexistent';
		await wrapper.vm.$nextTick();

		const emptySearch = wrapper.findComponent( EmptySearchEntrypoint );
		expect( emptySearch.exists() ).toBe( true );
		expect( emptySearch.props( 'entrypoints' ) ).toEqual( [
			expect.objectContaining( { id: 'test-empty-search-content' } )
		] );
	} );

	it( 'renders empty search entrypoint when mode is interface and search no results', async () => {
		wrapper = createWrapper( { mode: 'interface' } );
		wrapper.vm.searchQueryHits = { en: true };
		wrapper.vm.searchQuery = 'nonexistent';
		await wrapper.vm.$nextTick();

		const emptySearch = wrapper.findComponent( EmptySearchEntrypoint );
		expect( emptySearch.exists() ).toBe( true );
		expect( emptySearch.props( 'entrypoints' ) ).toEqual( [
			expect.objectContaining( { id: 'test-empty-search-interface' } )
		] );
	} );

	it( 'renders empty list entrypoint when mode is content and language list is empty', () => {
		wrapper = createWrapper( { mode: 'content', selectableLanguages: {} } );
		const emptyList = wrapper.findComponent( EmptyListEntrypoint );
		expect( emptyList.exists() ).toBe( true );
		expect( emptyList.props( 'entrypoints' ) ).toEqual( [
			expect.objectContaining( { id: 'test-empty-list-content' } )
		] );
	} );

	it( 'renders empty list entrypoint when mode is interface and language list is empty', () => {
		wrapper = createWrapper( { mode: 'interface', selectableLanguages: {} } );
		const emptyList = wrapper.findComponent( EmptyListEntrypoint );
		expect( emptyList.exists() ).toBe( true );
		expect( emptyList.props( 'entrypoints' ) ).toEqual( [
			expect.objectContaining( { id: 'test-empty-list-interface' } )
		] );
	} );

	it( 'renders quick action trigger when mode is content', () => {
		wrapper = createWrapper( { mode: 'content' } );
		expect( wrapper.findComponent( QuickActionTrigger ).exists() ).toBe( true );
	} );

	it( 'renders quick action trigger when mode is interface', () => {
		wrapper = createWrapper( { mode: 'interface' } );
		expect( wrapper.findComponent( QuickActionTrigger ).exists() ).toBe( true );
	} );
} );
