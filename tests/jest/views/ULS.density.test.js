'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );
const usePreferredLanguages = require( '../../../resources/ext.uls.rewrite/composables/usePreferredLanguages.js' );

const generateLanguages = ( count ) => {
	const result = {};
	for ( let i = 0; i < count; i++ ) {
		result[ `lang-${ i }` ] = `Language ${ i }`;
	}
	return result;
};

describe( 'UniversalLanguageSelector - density column', () => {
	let wrapper;
	const { preferredLanguages } = usePreferredLanguages();

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
		preferredLanguages.value = [];
	} );

	it( 'applies low density class when language count is less than 10 and there are no preferred languages', () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: generateLanguages( 5 )
		} );

		const menu = wrapper.find( '.uls-rewrite' );
		expect( menu.classes() ).toContain( 'uls-rewrite--density-low' );
		expect( menu.classes() ).not.toContain( 'uls-rewrite--density-medium' );
		expect( menu.classes() ).not.toContain( 'uls-rewrite--density-high' );
	} );

	it( 'applies medium density class when language count is less than 10 but preferred languages are present', () => {
		preferredLanguages.value = [ 'lang-0' ];

		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: generateLanguages( 5 )
		} );

		const menu = wrapper.find( '.uls-rewrite' );
		expect( menu.classes() ).toContain( 'uls-rewrite--density-medium' );
		expect( menu.classes() ).not.toContain( 'uls-rewrite--density-low' );
		expect( menu.classes() ).not.toContain( 'uls-rewrite--density-high' );
	} );

	it( 'applies medium density class when language count is between 10 and 29', () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: generateLanguages( 15 )
		} );

		const menu = wrapper.find( '.uls-rewrite' );
		expect( menu.classes() ).toContain( 'uls-rewrite--density-medium' );
		expect( menu.classes() ).not.toContain( 'uls-rewrite--density-low' );
		expect( menu.classes() ).not.toContain( 'uls-rewrite--density-high' );
	} );

	it( 'applies medium density class when language count is 0', () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: {}
		} );

		const menu = wrapper.find( '.uls-rewrite' );
		expect( menu.classes() ).toContain( 'uls-rewrite--density-medium' );
		expect( menu.classes() ).not.toContain( 'uls-rewrite--density-low' );
		expect( menu.classes() ).not.toContain( 'uls-rewrite--density-high' );
	} );

	it( 'applies high density class when language count is 30 or more', () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: generateLanguages( 35 )
		} );

		const menu = wrapper.find( '.uls-rewrite' );
		expect( menu.classes() ).toContain( 'uls-rewrite--density-high' );
		expect( menu.classes() ).not.toContain( 'uls-rewrite--density-low' );
		expect( menu.classes() ).not.toContain( 'uls-rewrite--density-medium' );
	} );
} );
