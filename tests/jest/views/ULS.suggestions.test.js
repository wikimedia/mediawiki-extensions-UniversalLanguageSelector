'use strict';

const { createWrapper, generateLanguages } = require( '../mocks/uls-test-helpers.js' );
const usePreferredLanguages = require( '../../../resources/ext.uls.rewrite/composables/usePreferredLanguages.js' );

describe( 'UniversalLanguageSelector - suggestions and preferred languages', () => {
	let wrapper;
	const { preferredLanguages } = usePreferredLanguages();

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
		preferredLanguages.value = [];
		jest.restoreAllMocks();
	} );

	describe( 'suggestions', () => {
		it( 'does not render suggestions section when language count is less than 10 and there are no preferred languages', () => {
			wrapper = createWrapper( {
				visible: true,
				selectableLanguages: generateLanguages( 5 )
			} );

			expect( wrapper.find( '.uls-rewrite__section--suggested' ).exists() ).toBe( false );
		} );

		it( 'renders suggestions section when language count is 10 or more', () => {
			jest.spyOn( mw.config, 'get' ).mockImplementation( ( key ) => {
				if ( key === 'wgULSAcceptLanguageList' ) {
					return [ 'fr', 'es' ];
				}
				return 'en';
			} );

			const selectableLanguages = generateLanguages( 12 );
			selectableLanguages.fr = 'Français';
			selectableLanguages.es = 'Español';
			selectableLanguages.en = 'English';

			wrapper = createWrapper( {
				visible: true,
				selectableLanguages
			} );

			const section = wrapper.find( '.uls-rewrite__section--suggested' );
			expect( section.exists() ).toBe( true );

			const languageList = section.findComponent( { name: 'LanguageList' } );
			expect( languageList.exists() ).toBe( true );
			expect( languageList.props( 'languageCodes' ) ).toEqual(
				expect.arrayContaining( [ 'fr', 'es', 'en' ] )
			);
		} );

		it( 'does not render suggestions section during an active search query', async () => {
			preferredLanguages.value = [ 'lang0' ];

			wrapper = createWrapper( {
				visible: true,
				selectableLanguages: generateLanguages( 15 )
			} );

			// Verify it is visible before searching
			expect( wrapper.find( '.uls-rewrite__section--suggested' ).exists() ).toBe( true );

			// Set an active search query
			wrapper.vm.searchQuery = 'nonexistent';
			await wrapper.vm.$nextTick();

			expect( wrapper.find( '.uls-rewrite__section--suggested' ).exists() ).toBe( false );
		} );

		it( 'shows only the maximum limit of suggested languages (6)', () => {
			jest.spyOn( mw.config, 'get' ).mockImplementation( ( key ) => {
				if ( key === 'wgULSAcceptLanguageList' ) {
					return [ 'lang0', 'lang1', 'lang2', 'lang3', 'lang4', 'lang5', 'lang6', 'lang7' ];
				}
				return 'en';
			} );

			wrapper = createWrapper( {
				visible: true,
				selectableLanguages: generateLanguages( 15 )
			} );

			const section = wrapper.find( '.uls-rewrite__section--suggested' );
			expect( section.exists() ).toBe( true );

			const languageList = section.findComponent( { name: 'LanguageList' } );
			expect( languageList.exists() ).toBe( true );
			expect( languageList.props( 'languageCodes' ) ).toHaveLength( 6 );
			expect( languageList.props( 'languageCodes' ) ).toEqual(
				[ 'lang0', 'lang1', 'lang2', 'lang3', 'lang4', 'lang5' ]
			);
		} );
	} );

	describe( 'preferred', () => {
		it( 'renders preferred languages when it is present', () => {
			preferredLanguages.value = [ 'lang0', 'lang1' ];

			wrapper = createWrapper( {
				visible: true,
				selectableLanguages: generateLanguages( 5 )
			} );

			const section = wrapper.find( '.uls-rewrite__section--suggested' );
			expect( section.exists() ).toBe( true );

			const header = section.find( '.uls-rewrite__section-title' );
			expect( header.text() ).toBe( 'ext-uls-preferred-languages-title' );

			const languageList = section.findComponent( { name: 'LanguageList' } );
			expect( languageList.exists() ).toBe( true );
			expect( languageList.props( 'languageCodes' ) ).toEqual( [ 'lang0', 'lang1' ] );
		} );

		it( 'includes unavailable preferred languages and flags them as unavailable', () => {
			// 'lang0' and 'lang1' exist in the selectable set, 'zz' does not.
			preferredLanguages.value = [ 'lang0', 'zz', 'lang1' ];

			wrapper = createWrapper( {
				visible: true,
				selectableLanguages: generateLanguages( 5 )
			} );

			const section = wrapper.find( '.uls-rewrite__section--suggested' );
			expect( section.exists() ).toBe( true );

			const languageList = section.findComponent( { name: 'LanguageList' } );
			expect( languageList.exists() ).toBe( true );

			// Unavailable languages are still rendered in the list...
			expect( languageList.props( 'languageCodes' ) ).toEqual( [ 'lang0', 'zz', 'lang1' ] );

			// ...but flagged as unavailable so they render disabled.
			const unavailableLanguagesSet = languageList.props( 'unavailableLanguagesSet' );
			expect( unavailableLanguagesSet.has( 'zz' ) ).toBe( true );
			expect( unavailableLanguagesSet.has( 'lang0' ) ).toBe( false );
			expect( unavailableLanguagesSet.has( 'lang1' ) ).toBe( false );
		} );

		it( 'shows only the maximum limit of preferred languages (10)', () => {
			preferredLanguages.value = [
				'lang0', 'lang1', 'lang2', 'lang3', 'lang4',
				'lang5', 'lang6', 'lang7', 'lang8', 'lang9',
				'lang10', 'lang11'
			];

			wrapper = createWrapper( {
				visible: true,
				selectableLanguages: generateLanguages( 15 )
			} );

			const section = wrapper.find( '.uls-rewrite__section--suggested' );
			expect( section.exists() ).toBe( true );

			const languageList = section.findComponent( { name: 'LanguageList' } );
			expect( languageList.exists() ).toBe( true );
			expect( languageList.props( 'languageCodes' ) ).toHaveLength( 10 );
			expect( languageList.props( 'languageCodes' ) ).toEqual( [
				'lang0', 'lang1', 'lang2', 'lang3', 'lang4',
				'lang5', 'lang6', 'lang7', 'lang8', 'lang9'
			] );
		} );
	} );

	describe( 'all-languages section title', () => {
		it( 'shows the title when another section renders above it', () => {
			preferredLanguages.value = [ 'lang0' ];

			wrapper = createWrapper( {
				visible: true,
				selectableLanguages: generateLanguages( 5 )
			} );

			const title = wrapper.find( '.uls-rewrite__section--all .uls-rewrite__section-title' );
			expect( title.exists() ).toBe( true );
			expect( title.text() ).toBe( 'ext-uls-all-languages-title' );
		} );

		it( 'hides the title when the all-languages section is the only one', () => {
			wrapper = createWrapper( {
				visible: true,
				selectableLanguages: generateLanguages( 5 )
			} );

			const section = wrapper.find( '.uls-rewrite__section--all' );
			expect( section.exists() ).toBe( true );
			expect( section.find( '.uls-rewrite__section-title' ).exists() ).toBe( false );
		} );
	} );
} );
