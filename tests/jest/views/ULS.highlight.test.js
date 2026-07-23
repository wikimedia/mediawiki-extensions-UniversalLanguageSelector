'use strict';

/**
 * UniversalLanguageSelector highlight tests.
 *
 * NOTE: This file focuses on highlight state updates on the UniversalLanguageSelector
 * (via @highlight events from LanguageList or direct calls to setHighlightedIndex).
 * Keyboard-driven highlighting and navigation is tested separately in ULS.keyboard.test.js.
 */

const { createWrapper, generateLanguages } = require( '../mocks/uls-test-helpers.js' );

describe( 'UniversalLanguageSelector - highlight', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'updates highlightedIndex when LanguageList emits highlight event', () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: generateLanguages( 5 )
		} );

		// Initial state: nothing is highlighted
		expect( wrapper.vm.highlightedIndex ).toBe( -1 );

		// 1. Verify indirect invocation via LanguageList @highlight event
		const languageList = wrapper.findComponent( { name: 'LanguageList' } );
		expect( languageList.exists() ).toBe( true );

		languageList.vm.$emit( 'highlight', 3 );
		expect( wrapper.vm.highlightedIndex ).toBe( 3 );

		// 2. Verify direct invocation of setHighlightedIndex helper function
		wrapper.vm.setHighlightedIndex( 4 );
		expect( wrapper.vm.highlightedIndex ).toBe( 4 );
	} );
} );
