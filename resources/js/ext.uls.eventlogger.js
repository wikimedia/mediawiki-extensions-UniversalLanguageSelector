/*!
 * ULS Event logger
 *
 * See https://meta.wikimedia.org/wiki/Schema:UniversalLanguageSelector
 *
 * @private
 * @since 2013.08
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

	/**
	 * Try to emit an EventLogging event with schema 'UniversalLanguageSelector'.
	 *
	 * If EventLogging is not installed, this simply does nothing.
	 *
	 * @param {Object} event Event action and optional fields
	 */
	function log( event ) {
		event = $.extend( {
			version: 1,
			token: mw.user.id(),
			contentLanguage: mw.config.get( 'wgContentLanguage' ),
			interfaceLanguage: mw.config.get( 'wgUserLanguage' )
		}, event );

		mw.track( 'event.UniversalLanguageSelector', event );
	}

	/**
	 * Log language settings open
	 *
	 * @param {string} context Where it was opened from
	 */
	function ulsSettingsOpen( context ) {
		log( {
			action: 'settings-open',
			context: context
		} );
	}

	/**
	 * Log language revert
	 *
	 * @param {jQuery.Deferred} deferred
	 */
	function ulsLanguageRevert( deferred ) {
		log( { action: 'ui-lang-revert' } ).always( deferred.resolve() );
	}

	/**
	 * Log IME disabling
	 *
	 * @param {string} context Where the setting was changed.
	 */
	function disableIME( context ) {
		log( { action: 'ime-disable', context: context } );
	}

	/**
	 * Log IME enabling
	 *
	 * @param {string} context Where the setting was changed.
	 */
	function enableIME( context ) {
		log( { action: 'ime-enable', context: context } );
	}

	/**
	 * Log IME change
	 *
	 * @param {string} inputMethod
	 */
	function changeIME( inputMethod ) {
		log( {
			action: 'ime-change',
			inputMethod: inputMethod
		} );
	}

	/**
	 * Log login link click in display settings.
	 *
	 * @param {jQuery.Deferred} deferred
	 */
	function loginClick( deferred ) {
		log( { action: 'login-click' } );
		deferred.resolve();
	}

	/**
	 * Log when "More languages" item in IME menu is clicked.
	 */
	function imeMoreLanguages() {
		log( {
			action: 'more-languages-access',
			context: 'ime'
		} );
	}

	/**
	 * Log interface language change
	 *
	 * @param {string} language language code
	 * @param {jQuery.Deferred} deferred
	 */
	function interfaceLanguageChange( language, deferred ) {
		var logParams = {
			action: 'language-change',
			context: 'interface',
			interfaceLanguage: language
		};

		log( logParams );
		deferred.resolve();
	}

	/**
	 * More languages in display settings is clicked
	 */
	function interfaceMoreLanguages() {
		log( {
			action: 'more-languages-access',
			context: 'interface'
		} );
	}

	/**
	 * Log font preference changes
	 *
	 * @param {string} context Either 'interface' or 'content'
	 * @param {string} language
	 * @param {string} font
	 */
	function fontChange( context, language, font ) {
		var logParams = {
			action: 'font-change',
			context: context
		};

		if ( context === 'interface' ) {
			logParams.interfaceFont = font;
			// Override in case the user changed the ui language but hasn't applied it yet
			logParams.interfaceLanguage = language;
		} else {
			logParams.contentFont = font;
		}

		log( logParams );
	}

	/**
	 * Log webfonts disabling
	 *
	 * @param {string} context Where the setting was changed.
	 */
	function disableWebfonts( context ) {
		log( { action: 'webfonts-disable', context: context } );
	}

	/**
	 * Log webfonts enabling
	 *
	 * @param {string} context Where the setting was changed.
	 */
	function enableWebfonts( context ) {
		log( { action: 'webfonts-enable', context: context } );
	}

	/**
	 * Log search strings which produce no search results.
	 *
	 * @param {jQuery.event} event The original event
	 * @param {Object} data Information about the failed search
	 */
	function noSearchResults( event, data ) {
		log( {
			action: 'no-search-results',
			context: data.query,
			ulsPurpose: data.ulsPurpose,
			title: mw.config.get( 'wgPageName' )
		} );
	}

	/**
	 * Start listening for event logging
	 */
	function listen() {
		// Register handlers for event logging triggers
		mw.hook( 'mw.uls.settings.open' ).add( ulsSettingsOpen );
		mw.hook( 'mw.uls.language.revert' ).add( ulsLanguageRevert );
		mw.hook( 'mw.uls.ime.enable' ).add( enableIME );
		mw.hook( 'mw.uls.ime.disable' ).add( disableIME );
		mw.hook( 'mw.uls.ime.change' ).add( changeIME );
		mw.hook( 'mw.uls.login.click' ).add( loginClick );
		mw.hook( 'mw.uls.ime.morelanguages' ).add( imeMoreLanguages );
		mw.hook( 'mw.uls.interface.morelanguages' ).add( interfaceMoreLanguages );
		mw.hook( 'mw.uls.interface.language.change' ).add( interfaceLanguageChange );
		mw.hook( 'mw.uls.font.change' ).add( fontChange );
		mw.hook( 'mw.uls.webfonts.enable' ).add( enableWebfonts );
		mw.hook( 'mw.uls.webfonts.disable' ).add( disableWebfonts );

		$( 'body' ).on(
			'noresults.uls',
			'.uls-menu .uls-languagefilter',
			noSearchResults
		);
	}

	listen();
}() );
