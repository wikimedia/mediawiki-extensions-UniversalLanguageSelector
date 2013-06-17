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
( function ( $, mw, undefined ) {
	'use strict';
	var mediawikiFontRepository, ulsPreferences;

	mw.webfonts = mw.webfonts || {};
	ulsPreferences = mw.uls.preferences();
	mw.webfonts.preferences = {
		registry: {
			fonts: {}
		},

		setFont: function ( language, font ) {
			this.registry.fonts[language] = font;
		},

		getFont: function ( language ) {
			return this.registry.fonts[language];
		},

		save: function ( callback ) {
			ulsPreferences.set( 'webfonts', this.registry );
			ulsPreferences.save( callback );
		},

		load: function () {
			mw.webfonts.preferences.registry = $.extend( this.registry,
				ulsPreferences.get( 'webfonts' ) );
		}
	};

	mediawikiFontRepository = $.webfonts.repository;
	mediawikiFontRepository.base = mw.config.get( 'wgExtensionAssetsPath' ) +
		'/UniversalLanguageSelector/data/fontrepo/fonts/';

	mw.webfonts.setup = function () {
		// Initialize webfonts
		$( 'body' ).webfonts( {
			fontSelector: function ( repository, language ) {
				var font;

				font = mw.webfonts.preferences.getFont( language );

				if ( !font ) {
					font = repository.defaultFont( language );
				}

				if ( font === 'system' ) {
					// Avoid setting 'system' as a font in css
					font = null;
				}

				return font;
			},
			exclude: ( function () {
				if ( mw.user.options.get( 'editfont' ) !== 'default' ) {
					// Exclude textboxes from webfonts if user has edit area font option
					// set using 'Preferences' page
					return 'textarea';
				}
				return $.fn.webfonts.defaults.exclude;
			}() )
		} );
	};

	$( document ).ready( function () {
		if ( !mw.uls.isBrowserSupported() ) {
			return;
		}
		// MediaWiki specific overrides for jquery.webfonts
		$.extend( $.fn.webfonts.defaults, {
			repository: mediawikiFontRepository,
			fontStack: new Array( $( 'body' ).css( 'font-family' ) )
		} );

		mw.webfonts.preferences.load();
		mw.webfonts.setup();
	} );

}( jQuery, mediaWiki ) );
