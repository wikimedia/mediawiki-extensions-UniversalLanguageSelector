'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );

describe( 'UniversalLanguageSelector - keyboard navigation', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'highlights language items on arrow down and up key presses', async () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: {
				en: 'English',
				fr: 'Français',
				es: 'Español'
			}
		} );

		const activeInput = wrapper.findAllComponents( { name: 'CdxSearchInput' } )
			.find( ( c ) => c.classes().includes( 'uls-rewrite__search-active' ) );

		// Initial state: nothing is highlighted
		expect( wrapper.vm.highlightedIndex ).toBe( -1 );

		// Keydown down -> highlights first language (index 0: 'en')
		await activeInput.trigger( 'keydown.down' );
		expect( wrapper.vm.highlightedIndex ).toBe( 0 );

		// Keydown down -> highlights second language (index 1: 'es' because of alphabetical autonymsort)
		await activeInput.trigger( 'keydown.down' );
		expect( wrapper.vm.highlightedIndex ).toBe( 1 );

		// Keydown up -> moves back to first language (index 0: 'en')
		await activeInput.trigger( 'keydown.up' );
		expect( wrapper.vm.highlightedIndex ).toBe( 0 );
	} );

	it( 'selects the highlighted language item and emits select on enter key press', async () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: {
				en: 'English',
				fr: 'Français',
				es: 'Español'
			}
		} );

		const activeInput = wrapper.findAllComponents( { name: 'CdxSearchInput' } )
			.find( ( c ) => c.classes().includes( 'uls-rewrite__search-active' ) );

		// Highlight the second language ('es')
		await activeInput.trigger( 'keydown.down' );
		await activeInput.trigger( 'keydown.down' );
		expect( wrapper.vm.highlightedIndex ).toBe( 1 );

		// Trigger keydown enter
		await activeInput.trigger( 'keydown.enter' );

		// Expect select event to be emitted
		expect( wrapper.emitted( 'select' ) ).toBeTruthy();
		expect( wrapper.emitted( 'select' )[ 0 ][ 0 ] ).toEqual( {
			code: 'es',
			value: 'Español'
		} );
	} );
} );
