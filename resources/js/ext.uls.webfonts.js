/**
 * ULS-Webfonts integration
 *
 * Copyright (C) 2012 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
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
( function ( $, mw, document, undefined ) {
	"use strict";

	$( document ).ready( function() {
		var mediawikiFontRepository = $.webfonts.repository;
		var webfontsPreferences = mw.uls.preferences( 'webfonts' );
		mediawikiFontRepository.base = mw.config.get( 'wgExtensionAssetsPath' )
			+ '/UniversalLanguageSelector/data/fontrepo/fonts/';

		// MediaWiki specific overrides for jquery.webfonts
		$.extend( $.fn.webfonts.defaults, {
			repository: mediawikiFontRepository,
			fontStack: ['sans-serif'] // MediaWiki default font as per screen.css
		} );

		// Initialize webfonts
		$( 'body' ).webfonts( {
			fontSelector: function ( repository, language ) {
				var font = webfontsPreferences.get( language );
				if ( !font ) {
					font = repository.defaultFont( language );
				}
				if ( font === 'system' ) {
					font = null;
				}
				return font;
			}
		} );
	} );
} )( jQuery, mediaWiki, document );
