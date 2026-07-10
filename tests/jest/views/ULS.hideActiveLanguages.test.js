'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );
const usePreferredLanguages = require( '../../../resources/ext.uls.rewrite/composables/usePreferredLanguages.js' );

// At least DENSITY_LOW_THRESHOLD (10) codes so the "suggested" section is
// eligible to render. 'en' matches the mocked wgUserLanguage/wgContentLanguage
// and is therefore the one code surfaced as a suggestion; the rest never are.
const SELECTABLE = {
	en: 'English',
	aa: 'Aa', bb: 'Bb', cc: 'Cc', dd: 'Dd', ee: 'Ee',
	ff: 'Ff', gg: 'Gg', hh: 'Hh', ii: 'Ii', jj: 'Jj'
};

// createWrapper() uses shallowMount, which stubs child components. Unstub
// LanguageList so we can read the codes it actually renders into each section.
const RENDER_LIST = { global: { stubs: { LanguageList: false } } };

/**
 * Codes rendered inside a given section modifier.
 *
 * @param {Object} wrapper
 * @param {string} modifier 'all' | 'suggested' | 'variants'
 * @return {string[]} Rendered language codes, [] if the section is absent.
 */
function codesInSection( wrapper, modifier ) {
	const section = wrapper.find( `.uls-rewrite__section--${ modifier }` );
	if ( !section.exists() ) {
		return [];
	}
	return section.findAll( '.uls-rewrite__language-item' )
		.map( ( item ) => item.attributes( 'data-language-code' ) );
}

describe( 'UniversalLanguageSelector - hideActiveLanguages', () => {
	let wrapper;
	const { preferredLanguages } = usePreferredLanguages();

	afterEach( () => {
		preferredLanguages.value = [];
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	describe( 'when true', () => {
		it( 'hides the active language from the all-languages list', () => {
			wrapper = createWrapper( {
				selectableLanguages: SELECTABLE,
				selected: [ 'aa' ],
				hideActiveLanguages: true
			}, RENDER_LIST );

			expect( codesInSection( wrapper, 'all' ) ).not.toContain( 'aa' );
		} );

		it( 'hides all active languages when several are selected', () => {
			wrapper = createWrapper( {
				selectableLanguages: SELECTABLE,
				selected: [ 'aa', 'bb' ],
				hideActiveLanguages: true
			}, RENDER_LIST );

			const codes = codesInSection( wrapper, 'all' );
			expect( codes ).not.toContain( 'aa' );
			expect( codes ).not.toContain( 'bb' );
		} );

		it( 'hides the active language from the suggested list', () => {
			wrapper = createWrapper( {
				selectableLanguages: SELECTABLE,
				selected: [ 'en' ],
				hideActiveLanguages: true
			}, RENDER_LIST );

			expect( codesInSection( wrapper, 'suggested' ) ).not.toContain( 'en' );
		} );

		it( 'does NOT hide the active language from the preferred list', () => {
			// Preferred languages render into the same section slot as the
			// suggested list; the filter must not apply to this branch.
			preferredLanguages.value = [ 'en', 'aa' ];
			wrapper = createWrapper( {
				selectableLanguages: SELECTABLE,
				selected: [ 'en' ],
				hideActiveLanguages: true
			}, RENDER_LIST );

			expect( codesInSection( wrapper, 'suggested' ) ).toContain( 'en' );
		} );
	} );

	describe( 'when false', () => {
		it( 'keeps the active language in the all-languages list and marks it selected', () => {
			wrapper = createWrapper( {
				selectableLanguages: SELECTABLE,
				selected: [ 'aa' ],
				hideActiveLanguages: false
			}, RENDER_LIST );

			expect( codesInSection( wrapper, 'all' ) ).toContain( 'aa' );

			const activeItem = wrapper.find(
				'.uls-rewrite__section--all .uls-rewrite__language-item[data-language-code="aa"]'
			);
			expect( activeItem.classes() ).toContain( 'uls-rewrite__language-item--selected' );
			expect( activeItem.attributes( 'aria-selected' ) ).toBe( 'true' );
		} );

		it( 'keeps the active language in the suggested list', () => {
			wrapper = createWrapper( {
				selectableLanguages: SELECTABLE,
				selected: [ 'en' ],
				hideActiveLanguages: false
			}, RENDER_LIST );

			expect( codesInSection( wrapper, 'suggested' ) ).toContain( 'en' );
		} );
	} );

	it( 'defaults to false, keeping the active language visible', () => {
		wrapper = createWrapper( {
			selectableLanguages: SELECTABLE,
			selected: [ 'aa' ]
			// hideActiveLanguages omitted -> prop default (false)
		}, RENDER_LIST );

		expect( codesInSection( wrapper, 'all' ) ).toContain( 'aa' );
	} );
} );
