'use strict';

const { createWrapper } = require( '../mocks/uls-test-helpers.js' );

describe( 'UniversalLanguageSelector - sorting', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	const getAllLanguageCodes = () => wrapper
		.find( '.uls-rewrite__section--all' )
		.findComponent( { name: 'LanguageList' } )
		.props( 'languageCodes' );

	it( 'sorts the all-languages list by display name using the display language collator', () => {
		wrapper = createWrapper( {
			displayLanguageCode: 'en',
			// Keys deliberately not in display-name order. 'ee' before 'nl'
			// shows the sort uses names, not codes.
			selectableLanguages: {
				es: 'Spanish',
				de: 'German',
				pt: 'Portuguese',
				fr: 'French',
				nl: 'Dutch',
				it: 'Italian',
				ee: 'Ewe',
				en: 'English',
				pl: 'Polish',
				fi: 'Finnish'
			}
		} );

		expect( getAllLanguageCodes() ).toEqual(
			[ 'nl', 'en', 'ee', 'fi', 'fr', 'de', 'it', 'pl', 'pt', 'es' ]
		);
	} );

	it( 'falls back to the default collator when displayLanguageCode is not a valid BCP 47 tag', () => {
		wrapper = createWrapper( {
			// MediaWiki code that Intl.Collator rejects
			displayLanguageCode: 'test',
			selectableLanguages: {
				fr: 'French',
				en: 'English'
			}
		} );

		expect( getAllLanguageCodes() ).toEqual( [ 'en', 'fr' ] );
	} );
} );
