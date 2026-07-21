'use strict';

// Mock language-data.json before requiring UniversalLanguageSelector
jest.mock( '../mocks/language-data.json', () => ( {
	rtlLanguages: [ 'ar', 'he' ]
} ) );

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );

describe( 'UniversalLanguageSelector - annotations', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
		jest.restoreAllMocks();
	} );

	it( 'assigns correct direction (ltr/rtl) to native language items when displayLanguageCode is not provided', () => {
		wrapper = createWrapper( {
			visible: true,
			displayLanguageCode: '', // No display language code, so items render in native languages
			selectableLanguages: {
				en: 'English',
				ar: 'العربية'
			}
		}, {
			global: {
				stubs: {
					LanguageList: false
				}
			}
		} );

		// English (en) is LTR, so its title span should have dir="ltr"
		const enTitle = wrapper.find( '[data-language-code="en"] .uls-rewrite__language-item-title' );
		expect( enTitle.exists() ).toBe( true );
		expect( enTitle.attributes( 'dir' ) ).toBe( 'ltr' );

		// Arabic (ar) is RTL, so its title span should have dir="rtl"
		const arTitle = wrapper.find( '[data-language-code="ar"] .uls-rewrite__language-item-title' );
		expect( arTitle.exists() ).toBe( true );
		expect( arTitle.attributes( 'dir' ) ).toBe( 'rtl' );
	} );

	it( 'does not assign individual directions to language items when displayLanguageCode is provided', () => {
		wrapper = createWrapper( {
			visible: true,
			displayLanguageCode: 'en', // Display language code provided, language selector displays in English
			selectableLanguages: {
				en: 'English',
				ar: 'Arabic'
			}
		}, {
			global: {
				stubs: {
					LanguageList: false
				}
			}
		} );

		// Since displayLanguageCode is provided, individual title spans should not have dir attributes
		const enTitle = wrapper.find( '[data-language-code="en"] .uls-rewrite__language-item-title' );
		expect( enTitle.exists() ).toBe( true );
		expect( enTitle.attributes( 'dir' ) ).toBeUndefined();

		const arTitle = wrapper.find( '[data-language-code="ar"] .uls-rewrite__language-item-title' );
		expect( arTitle.exists() ).toBe( true );
		expect( arTitle.attributes( 'dir' ) ).toBeUndefined();
	} );

	it( 'merges custom languageAnnotations correctly with language direction', () => {
		wrapper = createWrapper( {
			visible: true,
			displayLanguageCode: '',
			selectableLanguages: {
				en: 'English',
				ar: 'العربية'
			},
			languageAnnotations: {
				en: { description: 'Custom English description' },
				ar: { description: 'Custom Arabic description' }
			}
		}, {
			global: {
				stubs: {
					LanguageList: false
				}
			}
		} );

		// Verify custom description is merged and rendered
		const enDesc = wrapper.find( '[data-language-code="en"] .uls-rewrite__language-item--description' );
		expect( enDesc.exists() ).toBe( true );
		expect( enDesc.text() ).toBe( 'Custom English description' );
		expect( enDesc.attributes( 'dir' ) ).toBe( 'ltr' );

		const arDesc = wrapper.find( '[data-language-code="ar"] .uls-rewrite__language-item--description' );
		expect( arDesc.exists() ).toBe( true );
		expect( arDesc.text() ).toBe( 'Custom Arabic description' );
		expect( arDesc.attributes( 'dir' ) ).toBe( 'rtl' );
	} );

	it( 'applies custom CSS classes defined in languageAnnotations to language item elements', () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: {
				en: 'English',
				fr: 'Français'
			},
			languageAnnotations: {
				en: { classes: 'custom-class-string' },
				fr: { classes: [ 'custom-class-1', 'custom-class-2' ] }
			}
		}, {
			global: {
				stubs: {
					LanguageList: false
				}
			}
		} );

		// Verify class string is applied to English item
		const enItem = wrapper.find( 'li[data-language-code="en"]' );
		expect( enItem.exists() ).toBe( true );
		expect( enItem.classes() ).toContain( 'custom-class-string' );

		// Verify class array is applied to French item
		const frItem = wrapper.find( 'li[data-language-code="fr"]' );
		expect( frItem.exists() ).toBe( true );
		expect( frItem.classes() ).toContain( 'custom-class-1' );
		expect( frItem.classes() ).toContain( 'custom-class-2' );
	} );

	it( 'preserves custom annotation properties and passes them to the language-item slot', () => {
		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: {
				en: 'English'
			},
			languageAnnotations: {
				en: { customStatus: 'Beta' }
			}
		}, {
			global: {
				stubs: {
					LanguageList: false
				}
			},
			slots: {
				'language-item': `
					<template #language-item="{ item, annotations }">
						<span class="custom-badge">{{ item }} - {{ annotations.customStatus }}</span>
					</template>
				`
			}
		} );

		const badge = wrapper.find( '.custom-badge' );
		expect( badge.exists() ).toBe( true );
		expect( badge.text() ).toBe( 'English - Beta' );
	} );

	it( 'falls back to autonym or code when language name is missing from languages prop', () => {
		jest.spyOn( global.$.uls.data, 'getAutonym' ).mockImplementation( ( code ) => {
			if ( code === 'haw' ) {
				return 'Hawaii';
			}
			return '';
		} );

		wrapper = createWrapper( {
			visible: true,
			selectableLanguages: {
				haw: '',
				unknown: ''
			}
		}, {
			global: {
				stubs: {
					LanguageList: false
				}
			}
		} );

		const hawItem = wrapper.find( '[data-language-code="haw"] .uls-rewrite__language-item-title' );
		expect( hawItem.text() ).toBe( 'Hawaii' );

		const unknownItem = wrapper.find( '[data-language-code="unknown"] .uls-rewrite__language-item-title' );
		expect( unknownItem.text() ).toBe( 'unknown' );
	} );
} );
