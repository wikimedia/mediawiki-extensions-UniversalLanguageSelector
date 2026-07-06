'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );

describe( 'UniversalLanguageSelector - visible state', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'displays the language selector when visible is true', () => {
		wrapper = createWrapper( { visible: true } );
		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( true );
	} );

	it( 'does not display the language selector when visible is false', () => {
		wrapper = createWrapper( { visible: false } );
		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( false );
	} );
} );
