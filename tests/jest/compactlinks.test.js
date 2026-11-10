'use strict';

const languages = [ 'ar', 'de', 'es', 'fr', 'he', 'it', 'ja', 'nl', 'pl', 'pt', 'ru', 'zh' ];

describe( 'ext.uls.compactlinks', () => {
	let list;

	beforeEach( () => {
		document.body.innerHTML = '<div id="p-lang" class="mw-portlet mw-portlet-lang">' +
			'<div class="vector-menu-content"><ul class="vector-menu-content-list">' +
			languages.map( ( lang ) => '<li class="interlanguage-link interwiki-' + lang + '">' +
				'<a class="interlanguage-link-target" lang="' + lang + '" href="#">' + lang + '</a></li>'
			).join( '' ) +
			'</ul></div></div>';
		list = document.querySelector( '#p-lang ul' );

		global.$ = jest.fn( ( arg ) => {
			if ( typeof arg === 'function' ) {
				arg();
			}
			return {};
		} );
		mw.loader = { using: jest.fn( () => Promise.resolve() ) };
		mw.message = jest.fn( ( key ) => ( {
			text: () => key,
			plain: () => key
		} ) );
		mw.language = { convertNumber: jest.fn( ( n ) => String( n ) ) };
		mw.uls = {
			convertMediaWikiLanguageCodeToULS: jest.fn( ( code ) => code ),
			getInterlanguageListFromNodes: jest.fn( ( nodes ) => {
				const interlanguageList = {};
				Array.prototype.forEach.call( nodes, ( el ) => {
					interlanguageList[ el.lang ] = el;
				} );
				return interlanguageList;
			} ),
			getPreviousLanguages: jest.fn( () => [] ),
			getFrequentLanguageList: jest.fn( () => [] )
		};

		jest.isolateModules( () => {
			require( '../../resources/js/ext.uls.compactlinks.js' );
		} );
	} );

	it( 'adds the trigger after the language list, not inside it (T280598)', async () => {
		// The trigger is added once the Codex styles are loaded
		const codexIndex = mw.loader.using.mock.calls.findIndex(
			( args ) => args[ 0 ] === '@wikimedia/codex'
		);
		expect( codexIndex ).not.toBe( -1 );
		await mw.loader.using.mock.results[ codexIndex ].value;

		const trigger = document.querySelector( '#p-lang .mw-interlanguage-selector' );
		expect( trigger ).not.toBeNull();
		expect( trigger.tagName ).toBe( 'BUTTON' );
		expect( list.nextElementSibling ).toBe( trigger );
		Array.prototype.forEach.call( list.children, ( child ) => {
			expect( child.tagName ).toBe( 'LI' );
		} );
	} );
} );
