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
	'use strict';

	$( document ).ready( function () {
		var mediawikiFontRepository, webfontsPreferences;

		mediawikiFontRepository = $.webfonts.repository;
		webfontsPreferences = mw.uls.preferences( 'webfonts' );
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
				var font, enabled;

				font = webfontsPreferences.get( language );
				enabled = webfontsPreferences.get( 'webfonts-enabled' );
				// If the user didn't set anything, the preference will be undefined.
				// The default for now is to enable webfonts if the user didn't select anything.
				if ( enabled === undefined ) {
					enabled = true;
				}

				if ( !font ) {
					font = repository.defaultFont( language );
				}

				if ( font === 'system' || !enabled ) {
					font = null;
				}

				return font;
			},
			exclude: ( function () {
				if ( mw.user.options.get( 'editfont' ) ) {
					// Exclude textboxes from webfonts if user has edit area font option
					// set using 'Preferences' page
					return 'textarea';
				}

				return $.fn.webfonts.defaults.exclude;
			}() )
		} );
	} );
}( jQuery, mediaWiki, document ) );
