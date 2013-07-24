/**
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

( function ( $, mw ) {
	'use strict';

	mw.uls = mw.uls || {};

	// jquery.i18n has CLDRPluralRuleParser but MediaWiki also has the same
	// parser. Reuse it by aliasing it to window.pluralRuleParser
	window.pluralRuleParser = mw.libs.pluralRuleParser;

	// JavaScript side i18n initialization
	$.i18n( {
		locale: mw.config.get( 'wgUserLanguage' )
	} );

	// ApiULSLocalization handles fallback in ULS
	$.i18n.fallbacks = {};

	mw.uls.loadLocalization = function ( locale ) {
		var i18n = $.i18n();

		i18n.locale = locale;
		if ( i18n.messageStore.messages[locale] ) {
			return $.Deferred().resolve();
		}
		return i18n.load(
			mw.util.wikiScript( 'api' ) + '?action=ulslocalization&language=' + locale,
			locale
		);
	};

}( jQuery, mediaWiki ) );
