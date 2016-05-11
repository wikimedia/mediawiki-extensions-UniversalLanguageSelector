/*!
 * ULS startup script - MediaWiki specific customization for jquery.uls
 *
 * Copyright (C) 2012-2013 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
 * Niklas Laxström, Pau Giner, Santhosh Thottingal, Siebrand Mazeland and other
 * contributors. See CREDITS for a list.
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

( function ( $, mw ) {
	'use strict';

	/*
	 * The 'als' is used in a non-standard way in MediaWiki -
	 * it may be used to represent the Allemanic language,
	 * the standard code of which is 'gsw', while 'als'
	 * is ISO 639 3 refers to Tosk Albanian, which is
	 * not currently used in any way in MediaWiki.
	 * This local fix adds a redirect for it.
	 */
	$.uls.data.addLanguage( 'als', { target: 'gsw' } );

	mw.uls = mw.uls || {};
	mw.uls.previousLanguagesStorageKey = 'uls-previous-languages';
	mw.uls.languageSettingsModules = [ 'ext.uls.inputsettings', 'ext.uls.displaysettings' ];

	/**
	 * Change the language of wiki using API or set cookie and reload the page
	 *
	 * @param {string} language Language code.
	 */
	mw.uls.changeLanguage = function ( language ) {
		var deferred = new $.Deferred();

		function changeLanguageAnon() {
			if ( mw.config.get( 'wgULSAnonCanChangeLanguage' ) ) {
				mw.cookie.set( 'language', language );
				location.reload();
			}
		}

		deferred.done( function () {
			var api;

			if ( mw.user.isAnon() ) {
				changeLanguageAnon();
				return;
			}

			api = new mw.Api();
			api.saveOption( 'language', language )
			.done( function () {
				location.reload();
			} )
			.fail( function () {
				// Set options failed. Maybe the user has logged off.
				// Continue like anonymous user and set cookie.
				changeLanguageAnon();
			} );
		} );

		mw.hook( 'mw.uls.interface.language.change' ).fire( language, deferred );

		// Delay is zero if event logging is not enabled
		window.setTimeout( function () {
			deferred.resolve();
		}, mw.config.get( 'wgULSEventLogging' ) * 500 );

	};

	mw.uls.setPreviousLanguages = function ( previousLanguages ) {
		try {
			localStorage.setItem(
				mw.uls.previousLanguagesStorageKey,
				JSON.stringify( previousLanguages.slice( 0, 9 ) )
			);
		} catch ( e ) {}
	};

	mw.uls.getPreviousLanguages = function () {
		var previousLanguages = [];

		try {
			previousLanguages.push.apply(
				previousLanguages,
				JSON.parse( localStorage.getItem( mw.uls.previousLanguagesStorageKey ) )
			);
		} catch ( e ) {}

		return previousLanguages.slice( 0, 9 );
	};

	/**
	 * Add a selected language to the list of previously selected languages.
	 *
	 * @param {string} language Language code.
	 * @since 2016.05
	 */
	mw.uls.addPreviousLanguage = function ( language ) {
		var languages = mw.uls.getPreviousLanguages();

		// Avoid duplicates
		languages = $.map( languages, function ( element ) {
			return element === language ? undefined : element;
		} );
		languages.unshift( language );
		mw.uls.setPreviousLanguages( languages );
	};

	/**
	 * Returns the browser's user interface language or the system language.
	 * The caller should check the validity of the returned language code.
	 *
	 * @return {string} Language code or empty string.
	 */
	mw.uls.getBrowserLanguage = function () {
		// language is the standard property.
		// userLanguage is only for IE and returns system locale.
		// Empty string is a fallback in case both are undefined
		// to avoid runtime error with split().
		return ( window.navigator.language || window.navigator.userLanguage || '' ).split( '-' )[ 0 ];
	};

	mw.uls.getCountryCode = function () {
		// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
		return window.Geo && ( window.Geo.country || window.Geo.country_code );
		// jscs:enable requireCamelCaseOrUpperCaseIdentifiers
	};

	mw.uls.getAcceptLanguageList = function () {
		return mw.config.get( 'wgULSAcceptLanguageList' ) || window.navigator.languages || [];
	};

	/**
	 * Get a list of codes for languages to show in
	 * the "Common languages" section of the ULS.
	 * The list consists of the user's current selected language,
	 * the wiki's content language, the browser' UI language
	 * and Accept-Language, user's previous selected languages
	 * and finally, the languages of countryCode taken from the CLDR,
	 * taken by default from the user's geolocation.
	 *
	 * @param {string} [countryCode] Uppercase country code.
	 * @return {Array} List of language codes without duplicates.
	 */
	mw.uls.getFrequentLanguageList = function ( countryCode ) {
		var unique = [],
			list = [
				mw.config.get( 'wgUserLanguage' ),
				mw.config.get( 'wgContentLanguage' ),
				mw.uls.getBrowserLanguage()
			]
				.concat( mw.uls.getPreviousLanguages() )
				.concat( mw.uls.getAcceptLanguageList() );

		countryCode = countryCode || mw.uls.getCountryCode();

		if ( countryCode ) {
			list = list.concat( $.uls.data.getLanguagesInTerritory( countryCode ) );
		}

		$.each( list, function ( i, v ) {
			if ( $.inArray( v, unique ) === -1 ) {
				unique.push( v );
			}
		} );

		// Filter out unknown and unsupported languages
		unique = $.grep( unique, function ( langCode ) {
			// If the language is already known and defined, just use it.
			// $.uls.data.getAutonym will resolve redirects if any.
			if ( $.uls.data.getAutonym( langCode ) !== langCode ) {
				return true;
			}

			return false;
		} );

		return unique;
	};

}( jQuery, mediaWiki ) );
