'use strict';

const { nextTick } = require( 'vue' );
const { setMobileMode, createWrapper } = require( '../mocks/uls-test-helpers.js' );

describe( 'UniversalLanguageSelector - scroll lock', () => {
	let wrapper;

	afterEach( async () => {
		setMobileMode( false );
		// Allow any pending async focusInput calls to resolve and run before unmounting
		await nextTick();
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
		document.documentElement.classList.remove( 'uls-rewrite-no-scroll' );
		document.body.classList.remove( 'uls-rewrite-no-scroll' );
	} );

	it( 'does not lock scroll on desktop when visible', () => {
		setMobileMode( false );
		wrapper = createWrapper( { visible: true } );
		expect( document.documentElement.classList.contains( 'uls-rewrite-no-scroll' ) ).toBe( false );
		expect( document.body.classList.contains( 'uls-rewrite-no-scroll' ) ).toBe( false );
	} );

	it( 'locks scroll on mobile when visible', () => {
		setMobileMode( true );
		wrapper = createWrapper( { visible: true } );
		expect( document.documentElement.classList.contains( 'uls-rewrite-no-scroll' ) ).toBe( true );
		expect( document.body.classList.contains( 'uls-rewrite-no-scroll' ) ).toBe( true );
	} );

	it( 'removes scroll lock when visible becomes false on mobile', async () => {
		setMobileMode( true );
		wrapper = createWrapper( { visible: true } );
		expect( document.documentElement.classList.contains( 'uls-rewrite-no-scroll' ) ).toBe( true );

		await wrapper.setProps( { visible: false } );
		expect( document.documentElement.classList.contains( 'uls-rewrite-no-scroll' ) ).toBe( false );
		expect( document.body.classList.contains( 'uls-rewrite-no-scroll' ) ).toBe( false );
	} );

	it( 'removes scroll lock when component is unmounted', async () => {
		setMobileMode( true );
		wrapper = createWrapper( { visible: true } );
		expect( document.documentElement.classList.contains( 'uls-rewrite-no-scroll' ) ).toBe( true );

		// Re-enable positioning to resolve focusInput promise before unmounting
		setMobileMode( false );
		await nextTick();

		wrapper.unmount();
		wrapper = null;
		expect( document.documentElement.classList.contains( 'uls-rewrite-no-scroll' ) ).toBe( false );
		expect( document.body.classList.contains( 'uls-rewrite-no-scroll' ) ).toBe( false );
	} );
} );
