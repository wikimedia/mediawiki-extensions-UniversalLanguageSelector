'use strict';

const { createWrapper, generateLanguages } = require( '../mocks/uls-test-helpers.js' );
const { activeSearchResults } = require( 'mediawiki.languageselector.core' );

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
			selectableLanguages: generateLanguages( 3 )
		} );

		const activeInput = wrapper.findAllComponents( { name: 'CdxSearchInput' } )
			.find( ( c ) => c.classes().includes( 'uls-rewrite__search-active' ) );

		// Initial state: nothing is highlighted
		expect( wrapper.vm.highlightedIndex ).toBe( -1 );

		// Keydown down -> highlights first language (index 0: 'l00')
		await activeInput.trigger( 'keydown.down' );
		expect( wrapper.vm.highlightedIndex ).toBe( 0 );

		// Keydown down -> highlights second language (index 1: 'l01')
		await activeInput.trigger( 'keydown.down' );
		expect( wrapper.vm.highlightedIndex ).toBe( 1 );

		// Keydown up -> moves back to first language (index 0: 'l00')
		await activeInput.trigger( 'keydown.up' );
		expect( wrapper.vm.highlightedIndex ).toBe( 0 );
	} );

	it( 'selects the highlighted language item and emits select on enter key press', async () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: generateLanguages( 3 )
		} );

		const activeInput = wrapper.findAllComponents( { name: 'CdxSearchInput' } )
			.find( ( c ) => c.classes().includes( 'uls-rewrite__search-active' ) );

		// Highlight the second language ('l01')
		await activeInput.trigger( 'keydown.down' );
		await activeInput.trigger( 'keydown.down' );
		expect( wrapper.vm.highlightedIndex ).toBe( 1 );

		// Trigger keydown enter
		await activeInput.trigger( 'keydown.enter' );

		// Expect select event to be emitted
		expect( wrapper.emitted( 'select' ) ).toBeTruthy();
		expect( wrapper.emitted( 'select' )[ 0 ][ 0 ] ).toEqual( {
			code: 'lang1',
			value: 'Language 1'
		} );
	} );

	it( 'jumps highlighted index on page down and page up key presses', async () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: generateLanguages( 15 )
		} );

		const activeInput = wrapper.findAllComponents( { name: 'CdxSearchInput' } )
			.find( ( c ) => c.classes().includes( 'uls-rewrite__search-active' ) );

		// Initial state: nothing is highlighted
		expect( wrapper.vm.highlightedIndex ).toBe( -1 );

		// Keydown page-down -> jumps by pageSize (10) to index 9
		await activeInput.trigger( 'keydown.page-down' );
		expect( wrapper.vm.highlightedIndex ).toBe( 9 );

		// Keydown page-down -> jumps and clamps to the last item (index 14)
		await activeInput.trigger( 'keydown.page-down' );
		expect( wrapper.vm.highlightedIndex ).toBe( 14 );

		// Keydown page-up -> jumps back by 10 to index 4
		await activeInput.trigger( 'keydown.page-up' );
		expect( wrapper.vm.highlightedIndex ).toBe( 4 );

		// Keydown page-up -> jumps back and clamps to the first item (index 0)
		await activeInput.trigger( 'keydown.page-up' );
		expect( wrapper.vm.highlightedIndex ).toBe( 0 );
	} );
} );

describe( 'UniversalLanguageSelector - keyboard tab, right, esc', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
		activeSearchResults.value = [];
	} );

	it( 'fills typeahead suggestion into search query on tab key press', async () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: {
				en: 'English',
				fr: 'Français'
			}
		} );

		activeSearchResults.value = [ 'en' ];

		const activeInput = wrapper.findAllComponents( { name: 'CdxSearchInput' } )
			.find( ( c ) => c.classes().includes( 'uls-rewrite__search-active' ) );

		await activeInput.find( 'input' ).setValue( 'Eng' );

		await activeInput.trigger( 'keydown.tab' );

		expect( wrapper.vm.searchQuery ).toBe( 'English' );
	} );

	it( 'fills typeahead suggestion into search query on right arrow key press when cursor is at the end', async () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: {
				en: 'English',
				fr: 'Français'
			}
		} );

		activeSearchResults.value = [ 'en' ];

		const activeInput = wrapper.findAllComponents( { name: 'CdxSearchInput' } )
			.find( ( c ) => c.classes().includes( 'uls-rewrite__search-active' ) );

		const inputEl = activeInput.find( 'input' ).element;
		await activeInput.find( 'input' ).setValue( 'Eng' );
		inputEl.selectionStart = 3;

		await activeInput.trigger( 'keydown.right' );

		expect( wrapper.vm.searchQuery ).toBe( 'English' );
	} );

	it( 'emits the close event when escape key is pressed inside the search input', async () => {
		wrapper = createWrapper( {
			onClose: async () => {
				await wrapper.setProps( { visible: false } );
			}
		} );

		const activeInput = wrapper.findAllComponents( { name: 'CdxSearchInput' } )
			.find( ( c ) => c.classes().includes( 'uls-rewrite__search-active' ) );

		await activeInput.trigger( 'keydown.esc' );

		expect( wrapper.emitted( 'close' ) ).toBeTruthy();
		expect( wrapper.emitted( 'close' ) ).toHaveLength( 1 );
		expect( wrapper.find( '.uls-rewrite' ).isVisible() ).toBe( false );
	} );
} );
