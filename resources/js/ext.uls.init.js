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

( function ( $, mw, undefined ) {
	'use strict';

	// MediaWiki override for ULS defaults.
	$.fn.uls.defaults = $.extend( $.fn.uls.defaults, {
		languages: mw.config.get( 'wgULSLanguages' ),
		searchAPI: mw.util.wikiScript( 'api' ) + '?action=languagesearch'
	} );

	// No need of IME in language search bar of ULS
	$.fn.uls.Constructor.prototype.render = function () {
		this.$languageFilter.addClass( 'noime' );
	};

	var jsonLoader,
		initialized = false,
		currentLang = mw.config.get( 'wgUserLanguage' ),
		logEventQueue = $.Callbacks( 'memory once' );

	mw.uls = mw.uls || {};
	mw.uls.previousLanguagesCookie = 'uls-previous-languages';
	/**
	 * Change the language of wiki using setlang URL parameter
	 * @param {String} language
	 */
	mw.uls.changeLanguage = function ( language ) {
		var uri = new mw.Uri( window.location.href );

		uri.extend( {
			setlang: language
		} );
		window.location.href = uri.toString();
	};

	mw.uls.setPreviousLanguages = function ( previousLanguages ) {
		$.cookie( mw.uls.previousLanguagesCookie, $.toJSON( previousLanguages ),
			{ path: '/' } );
	};

	mw.uls.getPreviousLanguages = function () {
		var previousLanguages = $.cookie( mw.uls.previousLanguagesCookie );

		if ( !previousLanguages ) {
			return [];
		}

		// return last 5 language changes
		return $.parseJSON( previousLanguages ).slice( -5 );
	};

	mw.uls.getBrowserLanguage = function () {
		return ( window.navigator.language || window.navigator.userLanguage ).split( '-' )[0];
	};

	/*jshint camelcase:false*/
	mw.uls.getCountryCode = function () {
		return window.Geo && ( window.Geo.country || window.Geo.country_code );
	};

	mw.uls.getAcceptLanguageList = function () {
		return mw.config.get( 'wgULSAcceptLanguageList' );
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
			if ( $.fn.uls.defaults.languages[langCode] !== undefined ) {
				return true;
			}

			// If the language is not immediately known,
			// try to check is as a redirect
			target = $.uls.data.isRedirect( langCode );

			if ( target ) {
				// Check that the redirect's target is known
				// to this instance of ULS
				return $.fn.uls.defaults.languages[target] !== undefined;
			}

			return false;
		} );

		return unique;
	};

	/**
	 * Checks whether the browser is supported.
	 * Browse support policy: http://www.mediawiki.org/wiki/Browser_support#Grade_A
	 * @return boolean
	 */
	function isBrowserSupported() {
		// Blacklist Grade B browsers IE 6, 7 and IE60-IE79
		return !/MSIE [67]/i.test( navigator.userAgent );
	}

	/**
	 * Local wrapper for 'mw.eventLog.logEvent' which handles default params
	 * and ensures the correct schema is loaded.
	 *
	 * @param {Object} data Event action and optional fields
	 * @since 2013.07
	 * @see https://meta.wikimedia.org/wiki/Schema:UniversalLanguageSelector
	 */
	mw.uls.logEvent = function ( event ) {
		logEventQueue.add( function () {
			mw.eventLog.logEvent( 'UniversalLanguageSelector', event );
		} );
	};

	/**
	 * Initialize ULS front-end and its i18n.
	 *
	 * @param {Function} callback callback function to be called after initialization.
	 */
	mw.uls.init = function ( callback ) {

		callback = callback || $.noop;

		if ( initialized ) {
			callback.call( this );

			return;
		}

		if ( !isBrowserSupported() ) {
			$( '#pt-uls' ).hide();

			return;
		}

		// If EventLogging integration is enabled, set event defaults and make the
		// the function call event logging with correct schema.
		if ( mw.config.get( 'wgULSEventLogging' ) ) {
			mw.loader.using( 'schema.UniversalLanguageSelector', function () {
				mw.eventLog.setDefaults( 'UniversalLanguageSelector', {
					version: 1,
					token: mw.user.id(),
					contentLanguage: mw.config.get( 'wgContentLanguage' ),
					interfaceLanguage: currentLang
				} );
				logEventQueue.fire();
			} );
		}

		/*
		 * The 'als' is used in a non-standard way in MediaWiki -
		 * it may be used to represent the Allemanic language,
		 * the standard code of which is 'gsw', while 'als'
		 * is ISO 639 3 refers to Tosk Albanian, which is
		 * not currently used in any way in MediaWiki.
		 * This local fix adds a redirect for it.
		 */
		$.uls.data.addLanguage( 'als', { target: 'gsw' } );

		// JavaScript side i18n initialization
		$.i18n( {
			locale: currentLang,
			messageStore: mw.uls.messageStore
		} );

		if ( !jsonLoader ) {
			jsonLoader = mw.uls.messageStore.load( currentLang );
		} else {
			jsonLoader.done( function () {
				initialized = true;
			} );
			jsonLoader.done( callback );
		}
	};

	$( document ).ready( function () {
		mw.uls.init();
	} );
}( jQuery, mediaWiki ) );
