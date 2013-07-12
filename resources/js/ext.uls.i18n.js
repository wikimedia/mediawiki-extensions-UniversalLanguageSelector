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

( function ( $, mw, undefined ) {
	'use strict';

	// jquery.i18n has CLDRPluralRuleParser but MediaWiki also has the same
	// parser. Reuse it by aliasing it to window.pluralRuleParser
	window.pluralRuleParser = mw.libs.pluralRuleParser;

	/**
	 * jquery.i18n message store for MediaWiki
	 *
	 */
	var MWMessageStore = function () {
		this.messages = {};
	};

	MWMessageStore.prototype = {
		init: function () {},

		get: function ( locale, messageKey ) {
			return ( this.isLoaded( locale ) && this.messages[locale][messageKey] ) ||
				'<' + messageKey + '>';
		},

		set: function( locale, messages ) {
			this.messages[locale] = messages;
		},

		isLoaded: function ( locale ) {
			return this.messages[locale];
		},

		load: function ( locale ) {
			var store = this,
				deferred = $.Deferred(),
				url = mw.util.wikiScript( 'api' ) + '?action=ulslocalization&language=';

			if ( store.isLoaded( locale ) ) {
				return deferred.resolve();
			}

			deferred = $.getJSON( url + locale ).done( function ( data ) {
				store.set( locale, data );
			} ).fail( function ( jqxhr, settings, exception ) {
				mw.log( 'Error in loading messages from ' + url + ' Exception: ' + exception );
			} );
			return deferred.promise();
		}
	};
	mw.uls = mw.uls || {};
	mw.uls.messageStore = new MWMessageStore();
}( jQuery, mediaWiki ) );
