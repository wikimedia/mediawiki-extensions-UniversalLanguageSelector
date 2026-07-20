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

	it( 'has no axe violations while showing search results', async () => {
		wrapper = createFullWrapper( {
			selectableLanguages: { en: 'English', fr: 'Français', he: 'עברית' }
		} );

		await wrapper.find( 'input' ).setValue( 'fr' );

		expect( await axe( wrapper.element, axeOptions ) ).toHaveNoViolations();
	} );
} );
