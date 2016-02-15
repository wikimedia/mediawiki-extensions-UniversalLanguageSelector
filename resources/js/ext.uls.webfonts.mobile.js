/*!
 * MobileFrontend compatible ULS-Webfonts integration
 *
 * Copyright (C) 2013 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
 * Niklas Laxström, Pau Giner, Ryan Kaldari, Santhosh Thottingal, Siebrand Mazeland
 * and other contributors. See CREDITS for a list.
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

	var mediawikiFontRepository;

	mw.webfonts = mw.webfonts || {};

	mediawikiFontRepository = $.webfonts.repository;
	mediawikiFontRepository.base = mw.config.get( 'wgExtensionAssetsPath' ) +
		'/UniversalLanguageSelector/data/fontrepo/fonts/';

	$( document ).ready( function () {
		// MediaWiki specific overrides for jquery.webfonts
		$.extend( $.fn.webfonts.defaults, {
			repository: mediawikiFontRepository,
			fontStack: $( 'body' ).css( 'font-family' ).split( /, /g ),
			fontSelector: function ( repository, language ) {
				var font = repository.defaultFont( language );

				if ( font === 'system' ) {
					// Avoid setting 'system' as a font in css
					font = null;
				}

				return font;
			}
		} );

		$( 'body' ).webfonts();
	} );
}( jQuery, mediaWiki ) );
