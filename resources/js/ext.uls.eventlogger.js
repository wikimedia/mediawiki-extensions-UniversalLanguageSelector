/**
 * ULS Event logger
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

	/**
	 * ULS Event logger
	 *
	 * @since 2013.08
	 * @see https://meta.wikimedia.org/wiki/Schema:UniversalLanguageSelector
	 */
	function ULSEventLogger() {
		this.logEventQueue = $.Callbacks( 'memory once' );
		this.init();
		this.listen();
	}

	ULSEventLogger.prototype = {
		init: function () {
			var eventLogger = this;

			// Set event defaults and make the
			mw.eventLog.setDefaults( 'UniversalLanguageSelector', {
				version: 1,
				token: mw.user.id(),
				contentLanguage: mw.config.get( 'wgContentLanguage' ),
				interfaceLanguage: mw.config.get( 'wgUserLanguage' )
			} );

			eventLogger.logEventQueue.fire();
		},

		/**
		 * Local wrapper for 'mw.eventLog.logEvent' which handles default params
		 * and ensures the correct schema is loaded.
		 *
		 * @param {Object} event Event action and optional fields
		 * @param {int} [timeout] Fail the request if it is not completed within
		 *   the specified timeout. Can be use for example to log actions that
		 *   cause the browser to navigate to other pages.
		 * @return {jQuery.Promise} jQuery Promise object for the logging call
		 */
		log: function ( event, timeout ) {
			// We need to create our own deferred for two reasons:
			//  - logEvent might not be executed immediately
			//  - we cannot reject a promise returned by it
			// So we proxy the original promises status updates
			// and register our timeout if requested (for links).
			var deferred = $.Deferred();

			this.logEventQueue.add( function () {
				mw.eventLog.logEvent( 'UniversalLanguageSelector', event )
					.done( deferred.resolve )
					.fail( deferred.reject );
			} );

			if ( timeout !== undefined ) {
				window.setTimeout( deferred.reject, timeout );
			}

			return deferred.promise();
		},

		/**
		 * Listen for event logging
		 */
		listen: function () {
			// Register handlers for event logging triggers
			mw.hook( 'mw.uls.settings.open' ).add( $.proxy( this.ulsSettingsOpen, this ) );
			mw.hook( 'mw.uls.language.revert' ).add( $.proxy( this.ulsLanguageRevert, this ) );
			mw.hook( 'mw.uls.ime.enable' ).add( $.proxy( this.enableIME, this ) );
			mw.hook( 'mw.uls.ime.disable' ).add( $.proxy( this.disableIME, this ) );
			mw.hook( 'mw.uls.login.click' ).add( $.proxy( this.loginClick, this ) );
			mw.hook( 'mw.uls.ime.morelanguages' ).add( $.proxy( this.imeMoreLanguages, this ) );
			mw.hook( 'mw.uls.interface.morelanguages' ).add( $.proxy( this.interfaceMoreLanguages, this ) );
			mw.hook( 'mw.uls.interface.language.change' ).add( $.proxy( this.interfaceLanguageChange, this ) );
			mw.hook( 'mw.uls.font.change' ).add( $.proxy( this.fontChange, this ) );
			$( 'body' ).on( 'noresults.uls', '.uls-menu .languagefilter',
				 $.proxy( this.noSearchResults, this )
			);
		},

		/**
		 * Log language settings open
		 * @param {string} context Where it was opened from
		 */
		ulsSettingsOpen: function ( context ) {
			this.log( {
				action: 'settings-open',
				context: context
			} );
		},

		/**
		 * Log language revert
		 *
		 * @param {Function} callback
		 */
		ulsLanguageRevert: function ( callback ) {
			this.log( { action: 'ui-lang-revert' }, 500 ).always( callback );
		},

		/**
		 * Log IME disabling
		 */
		disableIME: function () {
			this.log( { action: 'ime-disable' } );
		},

		/**
		 * Log IME enabling
		 */
		enableIME: function () {
			this.log( { action: 'ime-enable' } );
		},

		/**
		 * Log login link click in display settings. Since this will navigate
		 * away from the current page, provide a callback option.
		 *
		 * If page is navigating away, event logging will fail because it is not
		 * yet completed. With the callback, the navigation can be executed in
		 * callback. The waiting for callback is not indefinite, but with a timeout.
		 *
		 * @param {Function} callback
		 */
		loginClick: function ( callback ) {
			this.log( { action: 'login-click' }, 500 ).always( callback );
		},

		/**
		 * More languages item in IME menu is clicked
		 */
		imeMoreLanguages: function () {
			this.log( {
				action: 'more-languages-access',
				context: 'ime'
			} );
		},

		/**
		 * Log interface language change
		 *
		 * @param {string} language language code
		 * @param {Function} callback
		 */
		interfaceLanguageChange: function ( language, callback ) {
			this.log( {
				action: 'language-change',
				context: 'interface',
				interfaceLanguage: language
			}, 500 ).always( callback );
		},

		/**
		 * More languages in display settings is clicked
		 */
		interfaceMoreLanguages: function () {
			this.log( {
				action: 'more-languages-access',
				context: 'interface'
			} );
		},

		/**
		 * Log font preference changes
		 *
		 * @param {string} context Either 'interface' or 'content'
		 * @param {string} language
		 * @param {string} font
		 */
		fontChange: function ( context, language, font ) {
			var logParams = {
				action: 'font-change',
				context: context
			};

			if ( context === 'interface' ) {
				$.extend( logParams, {
					interfaceFont: font,
					// Override in case the user changed the ui language but hasn't applied it yet
					interfaceLanguage: language
				} );
			} else {
				logParams.contentFont = font;
			}

			this.log( logParams );
		},

		/**
		 * Log search strings which produce no search results.
		 * @param {jQuery.event} event The orignal event
		 * @param {string} context The query string
		 */
		noSearchResults: function ( event, context ) {
			this.log( {
				action: 'no-search-results',
				context: context
			} );
		}
	};

	mw.uls = mw.uls || {};
	mw.uls.eventlogger = new ULSEventLogger();
}( jQuery, mediaWiki ) );
