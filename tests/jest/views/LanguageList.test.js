'use strict';

/**
 * LanguageList component unit tests.
 *
 * NOTE: Other functionalities of the LanguageList component (such as selection events,
 * annotations, sorting, active language hiding, and variants) are extensively covered
 * by integration tests inside the ULS view test files (e.g., ULS.annotations.test.js,
 * ULS.select.test.js, ULS.suggestions.test.js, etc.).
 */

const LanguageList = require( '../../../resources/ext.uls.rewrite/LanguageList.vue' );
const { shallowMount } = require( '@vue/test-utils' );

describe( 'LanguageList - idPrefix', () => {
	it( 'omits option element id when idPrefix is empty and uses default prop factories', () => {
		const listWrapper = shallowMount( LanguageList, {
			attachTo: document.body,
			props: {
				languageCodes: [ 'en' ],
				languages: { en: 'English' },
				listboxLabel: 'Languages',
				selectedValuesSet: new Set()
			}
		} );

		const option = listWrapper.find( 'li[data-language-code="en"]' );
		expect( option.exists() ).toBe( true );
		expect( option.attributes( 'id' ) ).toBeUndefined();

		listWrapper.unmount();
	} );
} );
