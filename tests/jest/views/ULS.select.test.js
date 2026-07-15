'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );
const usePreferredLanguages = require( '../../../resources/ext.uls.rewrite/composables/usePreferredLanguages.js' );

describe( 'UniversalLanguageSelector - selection', () => {
	let wrapper;
	const { preferredLanguages } = usePreferredLanguages();

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
		preferredLanguages.value = [];
		mw.storage.get.mockReset();
	} );

	it( 'emits select event when a language is selected', async () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: { en: 'English', fr: 'Français' }
		}, {
			global: {
				stubs: {
					LanguageList: false
				}
			}
		} );

		// Find the li element for language code "fr"
		const item = wrapper.find( '[data-language-code="fr"]' );
		expect( item.exists() ).toBe( true );

		await item.trigger( 'click' );

		expect( wrapper.emitted().select ).toBeTruthy();
		expect( wrapper.emitted().select ).toHaveLength( 1 );
		expect( wrapper.emitted().select[ 0 ] ).toEqual( [ { code: 'fr', value: 'Français' } ] );
	} );

	it( 'emits select event when a language is selected from the preferred language list', async () => {
		// Set fr as a preferred language
		preferredLanguages.value = [ 'fr' ];

		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: { en: 'English', fr: 'Français' }
		}, {
			global: {
				stubs: {
					LanguageList: false
				}
			}
		} );

		// Find the li element for language code "fr" in the preferred languages list
		const section = wrapper.find( '.uls-rewrite__section--suggested' );
		expect( section.exists() ).toBe( true );
		const item = section.find( '[data-language-code="fr"]' );
		expect( item.exists() ).toBe( true );

		await item.trigger( 'click' );

		expect( wrapper.emitted().select ).toBeTruthy();
		expect( wrapper.emitted().select ).toHaveLength( 1 );
		expect( wrapper.emitted().select[ 0 ] ).toEqual( [ { code: 'fr', value: 'Français' } ] );
	} );

	it( 'emits select event when a language is selected from the suggested language list', async () => {
		// Mock local storage to return fr as a previously used language, placing it in suggested list
		mw.storage.get.mockImplementation( ( key ) => {
			if ( key === 'uls-previous-languages' ) {
				return JSON.stringify( [ 'fr' ] );
			}
			return null;
		} );

		// Populate enough selectable languages to exceed the density low threshold (10)
		// so that the suggested languages section is rendered
		const selectableLanguages = { fr: 'Français' };
		for ( let i = 0; i < 12; i++ ) {
			selectableLanguages[ `lang${ i }` ] = `Language ${ i }`;
		}

		wrapper = createWrapper( {
			visible: true,
			selectableLanguages
		}, {
			global: {
				stubs: {
					LanguageList: false
				}
			}
		} );

		// Find the li element for language code "fr" in the suggested languages list
		const section = wrapper.find( '.uls-rewrite__section--suggested' );
		expect( section.exists() ).toBe( true );
		const item = section.find( '[data-language-code="fr"]' );
		expect( item.exists() ).toBe( true );

		await item.trigger( 'click' );

		expect( wrapper.emitted().select ).toBeTruthy();
		expect( wrapper.emitted().select ).toHaveLength( 1 );
		expect( wrapper.emitted().select[ 0 ] ).toEqual( [ { code: 'fr', value: 'Français' } ] );
	} );

	it( 'does not emit select event when clicking an unavailable language code from the preferred list', async () => {
		// Set fr as preferred but not available in selectableLanguages
		preferredLanguages.value = [ 'fr' ];

		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: { en: 'English' }
		}, {
			global: {
				stubs: {
					LanguageList: false
				}
			}
		} );

		// Find the li element for language code "fr" in the list of preferred/suggested languages
		const section = wrapper.find( '.uls-rewrite__section--suggested' );
		expect( section.exists() ).toBe( true );
		const item = section.find( '[data-language-code="fr"]' );
		expect( item.exists() ).toBe( true );

		await item.trigger( 'click' );

		expect( wrapper.emitted().select ).toBeUndefined();
	} );
} );
