'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );
const usePreferredLanguages = require( '../../../resources/ext.uls.rewrite/composables/usePreferredLanguages.js' );

const generateLanguages = ( count ) => {
	const result = {};
	for ( let i = 0; i < count; i++ ) {
		result[ `la${ i }` ] = `Language ${ i }`;
	}
	return result;
};

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
			preferredLanguages.value = [ 'lang-0' ];

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
					return [ 'la0', 'la1', 'la2', 'la3', 'la4', 'la5', 'la6', 'la7' ];
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
				[ 'la0', 'la1', 'la2', 'la3', 'la4', 'la5' ]
			);
		} );
	} );

	describe( 'preferred', () => {
		it( 'renders preferred languages when it is present', () => {
			preferredLanguages.value = [ 'lang-0', 'lang-1' ];

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
			expect( languageList.props( 'languageCodes' ) ).toEqual( [ 'lang-0', 'lang-1' ] );
		} );

		it( 'includes unavailable preferred languages and flags them as unavailable', () => {
			// 'la0' and 'la1' exist in the selectable set, 'zz' does not.
			preferredLanguages.value = [ 'la0', 'zz', 'la1' ];

			wrapper = createWrapper( {
				visible: true,
				selectableLanguages: generateLanguages( 5 )
			} );

			const section = wrapper.find( '.uls-rewrite__section--suggested' );
			expect( section.exists() ).toBe( true );

			const languageList = section.findComponent( { name: 'LanguageList' } );
			expect( languageList.exists() ).toBe( true );

			// Unavailable languages are still rendered in the list...
			expect( languageList.props( 'languageCodes' ) ).toEqual( [ 'la0', 'zz', 'la1' ] );

			// ...but flagged as unavailable so they render disabled.
			const unavailableLanguagesSet = languageList.props( 'unavailableLanguagesSet' );
			expect( unavailableLanguagesSet.has( 'zz' ) ).toBe( true );
			expect( unavailableLanguagesSet.has( 'la0' ) ).toBe( false );
			expect( unavailableLanguagesSet.has( 'la1' ) ).toBe( false );
		} );

		it( 'shows only the maximum limit of preferred languages (10)', () => {
			preferredLanguages.value = [
				'la0', 'la1', 'la2', 'la3', 'la4',
				'la5', 'la6', 'la7', 'la8', 'la9',
				'la10', 'la11'
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
				'la0', 'la1', 'la2', 'la3', 'la4',
				'la5', 'la6', 'la7', 'la8', 'la9'
			] );
		} );
	} );
} );
