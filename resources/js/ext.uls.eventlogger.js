/*!
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
	 * See https://meta.wikimedia.org/wiki/Schema:UniversalLanguageSelector
	 *
	 * @since 2013.08
	 */
	function ULSEventLogger() {
		this.logEventQueue = $.Callbacks( 'memory once' );
		this.init();
		this.listen();
	}

	ULSEventLogger.prototype = {
		init: function () {
			var eventLogger = this;

			mw.eventLog.setDefaults( 'UniversalLanguageSelector', {
				version: 1,
				token: mw.user.id(),
				contentLanguage: mw.config.get( 'wgContentLanguage' ),
				interfaceLanguage: mw.config.get( 'wgUserLanguage' )
			} );

			eventLogger.logEventQueue.fire();
		},

		/**
		 * Local wrapper for 'mw.eventLog.logEvent'
		 *
		 * @param {Object} event Event action and optional fields
		 * @param {string} schema The schema; 'UniversalLanguageSelector' is the default
		 * @return {jQuery.Promise} jQuery Promise object for the logging call
		 */
		log: function ( event, schema ) {
			// We need to create our own deferred for two reasons:
			//  - logEvent might not be executed immediately
			//  - we cannot reject a promise returned by it
			// So we proxy the original promises status updates.
			var deferred = $.Deferred();

			schema = schema || 'UniversalLanguageSelector';

			this.logEventQueue.add( function () {
				mw.eventLog.logEvent( schema, event )
					.done( deferred.resolve )
					.fail( deferred.reject );
			} );

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
			mw.hook( 'mw.uls.ime.change' ).add( $.proxy( this.changeIME, this ) );
			mw.hook( 'mw.uls.login.click' ).add( $.proxy( this.loginClick, this ) );
			mw.hook( 'mw.uls.ime.morelanguages' ).add( $.proxy( this.imeMoreLanguages, this ) );
			mw.hook( 'mw.uls.interface.morelanguages' ).add( $.proxy( this.interfaceMoreLanguages, this ) );
			mw.hook( 'mw.uls.interface.language.change' ).add( $.proxy( this.interfaceLanguageChange, this ) );
			mw.hook( 'mw.uls.font.change' ).add( $.proxy( this.fontChange, this ) );
			mw.hook( 'mw.uls.webfonts.enable' ).add( $.proxy( this.enableWebfonts, this ) );
			mw.hook( 'mw.uls.webfonts.disable' ).add( $.proxy( this.disableWebfonts, this ) );

			$( 'body' ).on( 'noresults.uls', '.uls-menu .uls-languagefilter',
				$.proxy( this.noSearchResults, this )
			);
		},

		/**
		 * Log language settings open
		 *
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
		 * @param {jQuery.Deferred} deferred
		 */
		ulsLanguageRevert: function ( deferred ) {
			this.log( { action: 'ui-lang-revert' } ).always( deferred.resolve() );
		},

		/**
		 * Log IME disabling
		 *
		 * @param {string} context Where the setting was changed.
		 */
		disableIME: function ( context ) {
			this.log( { action: 'ime-disable', context: context } );
		},

		/**
		 * Log IME enabling
		 *
		 * @param {string} context Where the setting was changed.
		 */
		enableIME: function ( context ) {
			this.log( { action: 'ime-enable', context: context } );
		},

		/**
		 * Log IME change
		 *
		 * @param {string} inputMethod
		 */
		changeIME: function ( inputMethod ) {
			this.log( {
				action: 'ime-change',
				inputMethod: inputMethod
			} );
		},

		/**
		 * Log login link click in display settings.
		 *
		 * @param {jQuery.Deferred} deferred
		 */
		loginClick: function ( deferred ) {
			this.log( { action: 'login-click' } ).always( deferred.resolve );
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
		 * @param {jQuery.Deferred} deferred
		 */
		interfaceLanguageChange: function ( language, deferred ) {
			var logParams = {
				action: 'language-change',
				context: 'interface',
				interfaceLanguage: language
			};

			this.log( logParams ).always( deferred.resolve );
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
		 * Log webfonts disabling
		 *
		 * @param {string} context Where the setting was changed.
		 */
		disableWebfonts: function ( context ) {
			this.log( { action: 'webfonts-disable', context: context } );
		},

		/**
		 * Log webfonts enabling
		 *
		 * @param {string} context Where the setting was changed.
		 */
		enableWebfonts: function ( context ) {
			this.log( { action: 'webfonts-enable', context: context } );
		},

		/**
		 * Log search strings which produce no search results.
		 *
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
