/*!
 * ULS i18n preparation using jquery.i18n library
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

	mw.uls = mw.uls || {};

	// JavaScript side i18n initialization
	$.i18n( {
		locale: mw.config.get( 'wgUserLanguage' )
	} );

	/**
	 * T53923: Fix JavaScript error with language fallbacks.
	 * ULS use ApiULSLocalization to handle language fallbacks.
	 *
	 * T348376: Fix JavaScript language fallback mapping being
	 * overridden.
	 * This should not override the original mapping, as it's not
	 * only used by ULS.
	 */
	$.i18n.fallbacks = $.i18n.fallbacks || {};

	/**
	 * Load localization messages for a locale to the jquery.i18n
	 * messagestore.
	 * Also called by RL module ResourceLoaderULSJsonMessageModule
	 *
	 * @param {string} locale the language code
	 * @param {Object} [messages]
	 * @return {jQuery.Promise}
	 */
	mw.uls.loadLocalization = function ( locale, messages ) {
		var i18n = $.i18n();

		i18n.locale = locale;
		if ( messages ) {
			return i18n.load( messages, locale );
		}
		if ( i18n.messageStore.messages[ locale ] ) {
			return $.Deferred().resolve();
		}
		return i18n.messageStore.load(
			mw.util.wikiScript( 'api' ) + '?' + $.param( {
				action: 'ulslocalization',
				language: locale
			} ),
			locale
		);
	};

}() );
