'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );
const { activeSearchResults } = require( 'mediawiki.languageselector.core' );

const RENDER_LIST = { global: { stubs: { LanguageList: false } } };

describe( 'UniversalLanguageSelector - search', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
		activeSearchResults.value = [];
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

	it( 'filters language list in DOM to only display search results', async () => {
		wrapper = createWrapper( {
			selectableLanguages: {
				en: 'English',
				fr: 'Français',
				es: 'Español'
			}
		}, RENDER_LIST );

		activeSearchResults.value = [ 'fr' ];

		const input = wrapper.get( '.uls-rewrite__search-active' );
		await input.setValue( 'fr' );

		// Only French should be shown, English and Spanish should not be shown
		const items = wrapper.findAll( '.uls-rewrite__language-item' );
		expect( items ).toHaveLength( 1 );
		expect( items.at( 0 ).text() ).toContain( 'Français' );
	} );

	it( 'shows invalid search query view when there are no hits at all', async () => {
		wrapper = createWrapper();

		const input = wrapper.get( '.uls-rewrite__search-active' );
		await input.setValue( 'xyz' );

		// searchQueryHits is empty, so should show invalid language search
		const noResults = wrapper.find( '.uls-rewrite__no-results' );
		expect( noResults.exists() ).toBe( true );
	} );
} );
