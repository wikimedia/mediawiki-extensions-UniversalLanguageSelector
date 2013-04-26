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

( function ( $, mw, window, document, undefined ) {
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

	var currentLang = mw.config.get( 'wgUserLanguage' );
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
		$.cookie( mw.uls.previousLanguagesCookie, $.toJSON( previousLanguages ) );
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

	mw.uls.getCountryCode = function () {
		return window.Geo && ( window.Geo.country || window.Geo.country_code );
	};

	mw.uls.getAcceptLanguageList = function () {
		return mw.config.get( 'wgULSAcceptLanguageList' );
	};

	mw.uls.getFrequentLanguageList = function () {
		var countryCode,
			unique = [],
			list = [
				mw.config.get( 'wgUserLanguage' ),
				mw.config.get( 'wgContentLanguage' ),
				mw.uls.getBrowserLanguage()
			]
				.concat( mw.uls.getPreviousLanguages() )
				.concat( mw.uls.getAcceptLanguageList() );

		countryCode = mw.uls.getCountryCode();

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
			return $.fn.uls.defaults.languages[langCode];
		} );

		return unique;
	};

	/**
	 * i18n initialization
	 */
	function i18nInit() {
		var extensionPath, locales, i18n;

		extensionPath = mw.config.get( 'wgExtensionAssetsPath' ) +
			'/UniversalLanguageSelector/';

		locales = mw.config.get( 'wgULSi18nLocales' );
		i18n = $.i18n( {
			locale: currentLang,
			messageLocationResolver: function ( locale, messageKey ) {
				// Namespaces are not available in jquery.i18n yet. Developers prefix
				// the message key with a unique namespace like ext-uls-*

				if ( messageKey.indexOf( 'uls' ) === 0 ) {
					if ( $.inArray( locale, locales.uls ) >= 0 ) {
						return extensionPath + 'lib/jquery.uls/i18n/' + locale + '.json';
					}

					return false;
				}

				if ( messageKey.indexOf( 'ext-uls' ) === 0 ) {
					if ( $.inArray( locale, locales['ext-uls'] ) >= 0 ) {
						return extensionPath + 'i18n/' + locale + '.json';
					}

					return false;
				}
			}
		} );
	}

	$( document ).ready( function () {
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
		i18nInit();

	} );
}( jQuery, mediaWiki, window, document ) );
