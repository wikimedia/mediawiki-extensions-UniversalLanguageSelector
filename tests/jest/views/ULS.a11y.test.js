'use strict';

const { axe, toHaveNoViolations } = require( 'jest-axe' );
const { createWrapper, setMobileMode } = require( '../mocks/uls-test-helpers.js' );

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
} );
