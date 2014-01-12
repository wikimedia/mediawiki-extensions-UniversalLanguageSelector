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
			// get updated copy of preferences
			ulsPreferences = mw.uls.preferences();
			ulsPreferences.set( 'webfonts', this.registry );
			ulsPreferences.save( callback );
		},

		load: function () {
			mw.webfonts.preferences.registry = $.extend( this.registry,
				ulsPreferences.get( 'webfonts' ) );
		}
	};

	mediawikiFontRepository = $.webfonts.repository;
	mediawikiFontRepository.base = mw.config.get( 'wgULSFontRepositoryBasePath' );

	mw.webfonts.setup = function () {
		// Initialize webfonts
		$.fn.webfonts.defaults = $.extend( $.fn.webfonts.defaults, {
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
				var excludes = $.fn.webfonts.defaults.exclude;

				if ( mw.user.options.get( 'editfont' ) !== 'default' ) {
					// Exclude textboxes from webfonts if user has edit area font option
					// set using 'Preferences' page
					excludes = ( excludes )
						? excludes + ',textarea'
						: 'textarea';
				}

				return excludes;
			}() )
		} );

		// Execute after task queue is processed so that the rendering is complete.
		// This is important because webfonts behavior depends on the font-family
		// property values set by stylesheets.
		setTimeout( function() {
			$( 'body' ).webfonts();

			// Load the CSS required for the Autonym font. Note that this won't download the font.
			// Browsers are smart enough to delay it till some element with this font-family
			// becomes visible. For example: If there is a popup div with an element with class
			// 'autonym', without explicitly calling .webfonts() on it, Autonym font will not
			// be applied in general. But we ensure that the CSS is ready so that the font
			// will be applied automatically to such future elements.
			$( 'body' ).data( 'webfonts' ).load( 'Autonym' );
		}, 0 );
	};

	$( document ).ready( function () {
		mw.uls.init( function () {

			// MediaWiki specific overrides for jquery.webfonts
			$.extend( $.fn.webfonts.defaults, {
				repository: mediawikiFontRepository,
				fontStack: $( 'body' ).css( 'font-family' ).split( /, /g ),
				exclude: mw.config.get( 'wgULSNoWebfontsSelectors' ).join( ', ' )
			} );

			mw.webfonts.preferences.load();
			mw.webfonts.setup();
		} );
	} );
}( jQuery, mediaWiki ) );
