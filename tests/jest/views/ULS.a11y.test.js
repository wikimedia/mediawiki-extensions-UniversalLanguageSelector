'use strict';

const { axe, toHaveNoViolations } = require( 'jest-axe' );
const { createWrapper, setMobileMode } = require( '../mocks/uls-test-helpers.js' );
const { activeSearchResults } = require( 'mediawiki.languageselector.core' );

expect.extend( toHaveNoViolations );

// color-contrast needs a real layout engine, which JSDOM lacks
const axeOptions = { rules: { 'color-contrast': { enabled: false } } };

describe( 'UniversalLanguageSelector - accessibility', () => {
	let wrapper;

	const createFullWrapper = ( props = {} ) => createWrapper( props, {
		shallow: false,
		attachTo: document.body
	} );

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
		activeSearchResults.value = [];
	} );

	it( 'has no axe violations on desktop', async () => {
		wrapper = createFullWrapper();

		expect( await axe( wrapper.element, axeOptions ) ).toHaveNoViolations();
	} );

	it( 'has no axe violations on mobile', async () => {
		setMobileMode( true );
		wrapper = createFullWrapper();

		expect( await axe( wrapper.element, axeOptions ) ).toHaveNoViolations();

		setMobileMode( false );
	} );

	it( 'wires listbox ids to the combobox input', async () => {
		wrapper = createFullWrapper();
		const input = wrapper.find( '[role="combobox"]' );

		// every option has a unique id
		const ids = wrapper.findAll( '[role="option"]' ).map( ( o ) => o.attributes( 'id' ) );
		expect( ids.length ).toBeGreaterThan( 0 );
		expect( ids.every( Boolean ) ).toBe( true );
		expect( new Set( ids ).size ).toBe( ids.length );

		// aria-controls lists exactly the rendered listbox ids
		const listboxIds = wrapper.findAll( '[role="listbox"]' ).map( ( l ) => l.attributes( 'id' ) );
		expect( input.attributes( 'aria-controls' ).split( ' ' ).sort() ).toEqual( listboxIds.sort() );

		// after ArrowDown, aria-activedescendant matches the highlighted option's id
		await input.trigger( 'keydown.down' );
		const highlighted = wrapper.find( '.uls-rewrite__language-item--highlighted' );
		expect( highlighted.exists() ).toBe( true );
		expect( input.attributes( 'aria-activedescendant' ) ).toBe( highlighted.attributes( 'id' ) );

		// the highlighted state also passes axe
		expect( await axe( wrapper.element, axeOptions ) ).toHaveNoViolations();
	} );

	it( 'marks selected languages with aria-selected', () => {
		wrapper = createFullWrapper( {
			selectableLanguages: { en: 'English', fr: 'Français' },
			selected: [ 'fr' ]
		} );

		const byCode = ( code ) => wrapper.find( `[data-language-code="${ code }"]` );
		expect( byCode( 'fr' ).attributes( 'aria-selected' ) ).toBe( 'true' );
		expect( byCode( 'en' ).attributes( 'aria-selected' ) ).toBe( 'false' );
	} );

	it( 'has no axe violations while showing search results', async () => {
		wrapper = createFullWrapper( {
			selectableLanguages: { en: 'English', fr: 'Français', he: 'עברית' }
		} );

		await wrapper.find( 'input' ).setValue( 'fr' );

		expect( await axe( wrapper.element, axeOptions ) ).toHaveNoViolations();
	} );

	it( 'assigns option element ids and annotations to language list items', async () => {
		wrapper = createFullWrapper( {
			selectableLanguages: { en: 'English', fr: 'Français' },
			languageAnnotations: {
				en: { description: 'English description' }
			}
		} );

		const enOption = wrapper.find( 'li[data-language-code="en"]' );
		expect( enOption.exists() ).toBe( true );
		expect( enOption.attributes( 'id' ) ).toMatch( /-option-0$/ );

		const enDesc = wrapper.find( '[data-language-code="en"] .uls-rewrite__language-item--description' );
		expect( enDesc.exists() ).toBe( true );
		expect( enDesc.text() ).toBe( 'English description' );

		expect( await axe( wrapper.element, axeOptions ) ).toHaveNoViolations();
	} );

	it( 'updates searchStatus for screen reader announcements only after search is done', async () => {
		wrapper = createFullWrapper( {
			selectableLanguages: { en: 'English', fr: 'Français' }
		} );

		// 1. Initial state (no search query): searchStatus should be empty
		expect( wrapper.vm.searchStatus ).toBe( '' );

		// 2. Set search query and mark isSearching = true (simulating API search in progress)
		wrapper.vm.isSearching = true;
		activeSearchResults.value = [ 'fr' ];
		await wrapper.find( 'input' ).setValue( 'fr' );

		// The watcher should have executed but returned early because isSearching is true
		expect( wrapper.vm.searchStatus ).toBe( '' );

		// 3. Mark isSearching = false (simulating API search completion)
		wrapper.vm.isSearching = false;
		await wrapper.vm.$nextTick();

		// The watcher should execute and update searchStatus to the results count
		expect( wrapper.vm.searchStatus ).toBe( 'ext-uls-search-results-count' );

		// 4. Test when search returns no results
		wrapper.vm.isSearching = true;
		activeSearchResults.value = [];
		await wrapper.find( 'input' ).setValue( 'xyz' );

		// The status should remain unchanged until isSearching is false
		expect( wrapper.vm.searchStatus ).toBe( 'ext-uls-search-results-count' );

		wrapper.vm.isSearching = false;
		await wrapper.vm.$nextTick();

		// The watcher should execute and update searchStatus to "no results"
		expect( wrapper.vm.searchStatus ).toBe( 'ext-uls-search-results-none' );
	} );
} );
