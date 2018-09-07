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

( function () {
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
			var api = new mw.Api();

			if ( mw.user.isAnon() ) {
				changeLanguageAnon();
				return;
			}

			// TODO We can avoid doing this query if we know global preferences are not enabled
			api.get( {
				action: 'query',
				meta: 'globalpreferences',
				gprprop: 'preferences'
			} ).then( function ( res ) {
				// Check whether global preferences are in use. If they are not, `res.query` is
				// an empty object. `res` will also contain warnings about unknown parameters.
				try {
					return !!res.query.globalpreferences.preferences.language;
				} catch ( e ) {
					return false;
				}
			} ).then( function ( hasGlobalPreference ) {
				var apiModule;

				if ( hasGlobalPreference ) {
					apiModule = 'globalpreferenceoverrides';
					mw.storage.set( 'uls-gp', '1' );
				} else {
					apiModule = 'options';
					mw.storage.remove( 'uls-gp' );
				}

				return api.postWithToken( 'csrf', {
					action: apiModule,
					optionname: 'language',
					optionvalue: language
				} );
			} ).done( function () {
				location.reload();
			} ).fail( function () {
				// Setting the option failed. Maybe the user has logged off.
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
		var languages = mw.uls.getPreviousLanguages(),
			index = languages.indexOf( language );

		// Avoid duplicates
		if ( index !== -1 ) {
			languages.splice( index, 1 );
		}
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
		return window.Geo && ( window.Geo.country || window.Geo.country_code );
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
		var i, j, lang,
			ret = [],
			lists = [
				[
					mw.config.get( 'wgUserLanguage' ),
					mw.config.get( 'wgContentLanguage' ),
					mw.uls.getBrowserLanguage()
				],
				mw.uls.getPreviousLanguages(),
				mw.uls.getAcceptLanguageList()
			];

		countryCode = countryCode || mw.uls.getCountryCode();
		if ( countryCode ) {
			lists.push( $.uls.data.getLanguagesInTerritory( countryCode ) );
		}

		for ( i = 0; i < lists.length; i++ ) {
			for ( j = 0; j < lists[ i ].length; j++ ) {
				lang = lists[ i ][ j ];
				// Make flat, make unique, and ignore unknown/unsupported languages
				if ( ret.indexOf( lang ) === -1 && $.uls.data.getAutonym( lang ) !== lang ) {
					ret.push( lang );
				}
			}
		}

		return ret;
	};

}() );
