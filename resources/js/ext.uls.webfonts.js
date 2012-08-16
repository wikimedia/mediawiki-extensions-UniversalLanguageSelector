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
( function ( $, mw ) {
	"use strict";
	$( document ).ready( function() {
		var mediawikiFontRepository = $.webfonts.repository;
		mediawikiFontRepository.base = mw.config.get( 'wgExtensionAssetsPath' )
			+ '/UniversalLanguageSelector/data/fontrepo/fonts/';
		$( 'body' ).webfonts( {
			repository: mediawikiFontRepository
		} );
		var $webfonts = $( 'body' ).data( 'webfonts' );
		var webfontPreferences = new $.fn.uls.preferences( 'webfonts' );
		var rememberedFont = webfontPreferences.get( mw.config.get( 'wgUserLanguage' ) );
		if ( rememberedFont === 'system' ) {
			$webfonts.reset();
		} else {
			// FIXME: jquery.webfonts should have an option to specify default font to use.
			$webfonts.apply( rememberedFont );
		}
	} );
} )( jQuery, mediaWiki );