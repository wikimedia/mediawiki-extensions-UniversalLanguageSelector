/**
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

	var hasOwn = Object.prototype.hasOwnProperty;

	mw.uls = mw.uls || {};
	mw.uls.previousLanguagesStorageKey = 'uls-previous-languages';
	mw.uls.previousLanguageAutonymCookie = 'uls-previous-language-autonym';
	mw.uls.languageSettingsModules = [ 'ext.uls.inputsettings', 'ext.uls.displaysettings' ];

	// What was the last thing that the user did to select the language:
	// * 'map' - clicked the map
	// * 'search' - typed in the search box
	// * 'common' - clicked a link in the "Common languages" section
	// If the user just clicked in some other section, it remains undefined.
	// This is useful for logging.
	mw.uls.languageSelectionMethod = undefined;

	/**
	 * Add event logging triggers, which are common to different
	 * ULS instances
	 */
	mw.uls.addEventLoggingTriggers = function () {
		// Remove previous values when reinitializing
		mw.uls.languageSelectionMethod = undefined;

		$( '#uls-map-block' ).on( 'click', function () {
			mw.uls.languageSelectionMethod = 'map';
		} );

		$( '#uls-languagefilter' ).on( 'keydown', function () {
			// If it's the first letter,
			// log the usage of the search box
			if ( $( this ).val() === '' ) {
				mw.uls.languageSelectionMethod = 'search';
			}
		} );

		$( '#uls-lcd-quicklist a' ).on( 'click', function () {
			mw.uls.languageSelectionMethod = 'common';
		} );
	};

	/**
	 * Change the language of wiki using API or set cookie and reload the page
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
			// @todo Change this to api.saveOption when ULS minimum MW version is 1.25
			api.postWithToken( 'options', {
				action: 'options',
				optionname: 'language',
				optionvalue: language
			} )
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
				JSON.stringify( previousLanguages.slice( -5 ) )
			);
		} catch ( e ) {}
	};

	mw.uls.getPreviousLanguages = function () {
		var previousLanguages = $.cookie( mw.uls.previousLanguagesStorageKey );

		$.removeCookie( mw.uls.previousLanguagesStorageKey, { path: '/' } );

		if ( $.isArray( previousLanguages ) ) {
			// Migrate data from cookie to localStorage.
			mw.uls.setPreviousLanguages( previousLanguages );
		} else {
			previousLanguages = [];
		}

		try {
			previousLanguages.push.apply(
				previousLanguages,
				JSON.parse( localStorage.getItem( mw.uls.previousLanguagesStorageKey ) )
			);
		} catch ( e ) {}

		return previousLanguages.slice( -5 );
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

	/*jshint camelcase:false*/
	mw.uls.getCountryCode = function () {
		return window.Geo && ( window.Geo.country || window.Geo.country_code );
	};

	mw.uls.getAcceptLanguageList = function () {
		return mw.config.get( 'wgULSAcceptLanguageList' ) || [];
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
	 * @param {String} [countryCode] Uppercase country code.
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
			var target;

			// If the language is already known and defined, just use it
			if ( hasOwn.call( $.fn.uls.defaults.languages, langCode ) ) {
				return true;
			}

			// If the language is not immediately known,
			// try to check is as a redirect
			target = $.uls.data.isRedirect( langCode );

			if ( target ) {
				// Check that the redirect's target is known
				// to this instance of ULS
				return hasOwn.call( $.fn.uls.defaults.languages, target );
			}

			return false;
		} );

		return unique;
	};

	/**
	 * Checks whether the browser is supported.
	 * Browser support policy: http://www.mediawiki.org/wiki/Browser_support#Grade_A
	 * @return boolean
	 */
	function isBrowserSupported() {
		var blacklist = {
			'msie': [
				[ '<=', 7 ]
			]
		};

		return !$.client.test( blacklist, null, true );
	}

	/**
	 * Initialize ULS front-end if browser is supported.
	 *
	 * @param {Function} callback callback function to be called after initialization.
	 */
	mw.uls.init = function ( callback ) {
		if ( !isBrowserSupported() ) {
			$( '#pt-uls' ).hide();

			return;
		}

		if ( callback ) {
			callback.call( this );
		}
	};

	$( document ).ready( function () {
		mw.uls.init();
	} );
}( jQuery, mediaWiki ) );
