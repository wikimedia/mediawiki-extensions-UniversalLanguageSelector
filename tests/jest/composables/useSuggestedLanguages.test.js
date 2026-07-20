'use strict';

const PREVIOUS_LANG = 'zh';
const USER_LANG = 'en';
const CONTENT_LANG = 'fr';
const BROWSER_LANG = 'de';
const BROWSER_LANG_FULL = 'de-DE';
const ACCEPT_LANG = 'es';
const ACCEPT_LANG_FULL = 'es-ES';
const TERRITORY_LANG = 'haw';

const mockTerritories = {
	US: [ USER_LANG, TERRITORY_LANG ],
	FR: [ CONTENT_LANG ]
};

jest.mock( '../mocks/language-data.json', () => ( {
	territories: mockTerritories
} ) );

const { ref } = require( 'vue' );
const useSuggestedLanguages = require( '../../../resources/ext.uls.rewrite/composables/useSuggestedLanguages.js' );

describe( 'useSuggestedLanguages', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.Geo = { country: 'US' };
		mw.config.get.mockImplementation( ( key ) => {
			if ( key === 'wgUserLanguage' ) {
				return USER_LANG;
			}
			if ( key === 'wgContentLanguage' ) {
				return CONTENT_LANG;
			}
			if ( key === 'wgULSAcceptLanguageList' ) {
				return [ ACCEPT_LANG_FULL ];
			}
			return null;
		} );

		Object.defineProperty( window.navigator, 'language', {
			value: BROWSER_LANG_FULL,
			configurable: true
		} );
		Object.defineProperty( window.navigator, 'languages', {
			value: [ BROWSER_LANG_FULL, 'it-IT' ],
			configurable: true
		} );
	} );

	afterEach( () => {
		delete window.Geo;
	} );

	it( 'returns the list of suggested languages', () => {
		const previousLanguages = ref( [ PREVIOUS_LANG ] );
		const { getSuggestedLanguages } = useSuggestedLanguages();

		const suggested = getSuggestedLanguages( previousLanguages );

		expect( suggested.value ).toEqual( [
			PREVIOUS_LANG, // previousLanguages
			USER_LANG, // wgUserLanguage
			CONTENT_LANG, // wgContentLanguage
			BROWSER_LANG, // browserLanguage (navigator.language)
			ACCEPT_LANG, // acceptLanguages (wgULSAcceptLanguageList)
			TERRITORY_LANG // territory language for US (based on mock language-data.js)
		] );
	} );

	it( 'filters out duplicates and empty/falsy values', () => {
		const previousLanguages = ref( [ PREVIOUS_LANG, PREVIOUS_LANG, '', null, undefined ] );
		const { getSuggestedLanguages } = useSuggestedLanguages();

		const suggested = getSuggestedLanguages( previousLanguages );

		expect( suggested.value ).toEqual( [
			PREVIOUS_LANG, // previousLanguages
			USER_LANG, // wgUserLanguage
			CONTENT_LANG, // wgContentLanguage
			BROWSER_LANG, // browserLanguage (navigator.language)
			ACCEPT_LANG, // acceptLanguages (wgULSAcceptLanguageList)
			TERRITORY_LANG // territory language for US (based on mock language-data.js)
		] );
	} );

	it( 'filters suggested languages against validLanguageCodes', () => {
		const previousLanguages = ref( [ PREVIOUS_LANG ] );
		const validLanguageCodes = ref( [ PREVIOUS_LANG, USER_LANG ] );
		const { getSuggestedLanguages } = useSuggestedLanguages();

		const suggested = getSuggestedLanguages( previousLanguages, validLanguageCodes );

		expect( suggested.value ).toEqual( [
			PREVIOUS_LANG,
			USER_LANG
		] );

		// Confirm that the other language codes were filtered out
		expect( suggested.value ).not.toContain( CONTENT_LANG );
		expect( suggested.value ).not.toContain( BROWSER_LANG );
		expect( suggested.value ).not.toContain( ACCEPT_LANG );
		expect( suggested.value ).not.toContain( TERRITORY_LANG );
	} );

	it( 'handles falsy navigator.language', () => {
		Object.defineProperty( window.navigator, 'language', {
			value: '',
			configurable: true
		} );

		const previousLanguages = ref( [ PREVIOUS_LANG ] );
		const { getSuggestedLanguages } = useSuggestedLanguages();

		const suggested = getSuggestedLanguages( previousLanguages );

		expect( suggested.value ).toEqual( [
			PREVIOUS_LANG,
			USER_LANG,
			CONTENT_LANG,
			ACCEPT_LANG,
			TERRITORY_LANG
		] );
	} );

	it( 'falls back to empty array when wgULSAcceptLanguageList and navigator.languages are both falsy', () => {
		mw.config.get.mockImplementation( ( key ) => {
			if ( key === 'wgUserLanguage' ) {
				return USER_LANG;
			}
			if ( key === 'wgContentLanguage' ) {
				return CONTENT_LANG;
			}
			return null;
		} );
		Object.defineProperty( window.navigator, 'languages', {
			value: '',
			configurable: true
		} );

		const previousLanguages = ref( [ PREVIOUS_LANG ] );
		const { getSuggestedLanguages } = useSuggestedLanguages();

		const suggested = getSuggestedLanguages( previousLanguages );

		expect( suggested.value ).toEqual( [
			PREVIOUS_LANG,
			USER_LANG,
			CONTENT_LANG,
			BROWSER_LANG,
			TERRITORY_LANG
		] );
	} );
} );
