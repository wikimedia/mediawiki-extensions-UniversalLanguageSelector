'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );

describe( 'UniversalLanguageSelector - search', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'shows the no-results view when a search query has no hits', async () => {
		wrapper = createWrapper();

		expect( wrapper.find( '.uls-rewrite__no-results' ).exists() ).toBe( false );

		// Typing forwards update:model-value to the composable's search()
		await wrapper.get( '.uls-rewrite__search-active' ).setValue( 'xyz' );

		expect( wrapper.find( '.uls-rewrite__no-results' ).exists() ).toBe( true );
	} );

	it( 'returns to the main view when the search query is cleared', async () => {
		wrapper = createWrapper();

		const input = wrapper.get( '.uls-rewrite__search-active' );
		await input.setValue( 'xyz' );
		expect( wrapper.find( '.uls-rewrite__no-results' ).exists() ).toBe( true );

		await input.setValue( '' );
		expect( wrapper.find( '.uls-rewrite__no-results' ).exists() ).toBe( false );
	} );
} );
