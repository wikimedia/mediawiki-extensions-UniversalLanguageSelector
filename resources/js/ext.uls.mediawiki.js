/*!
 * jquery.uls defaults for MediaWiki.
 *
 * Copyright (C) 2013 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
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

	// MediaWiki overrides for ULS defaults
	$.fn.uls.defaults = $.extend( $.fn.uls.defaults, {
		languages: mw.config.get( 'wgULSLanguages' ) || {},
		searchAPI: mw.util.wikiScript( 'api' ) + '?action=languagesearch&format=json'
	} );

	// No need of IME in the ULS language search bar
	$.fn.uls.Constructor.prototype.render = function () {
		this.$languageFilter.addClass( 'noime' );
	};
}( jQuery, mediaWiki ) );
