/*!
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

( function () {
	'use strict';

	var ulsPreferences;

	mw.webfonts = mw.webfonts || {};
	ulsPreferences = mw.uls.preferences();
	mw.webfonts.preferences = {
		registry: {
			fonts: {},
			webfontsEnabled: mw.config.get( 'wgULSWebfontsEnabled' )
		},

		isEnabled: function () {
			return this.registry.webfontsEnabled;
		},

		enable: function () {
			this.registry.webfontsEnabled = true;
		},

		disable: function () {
			this.registry.webfontsEnabled = false;
		},

		setFont: function ( language, font ) {
			this.registry.fonts[ language ] = font;
		},

		getFont: function ( language ) {
			return this.registry.fonts[ language ];
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

	mw.webfonts.setup = function () {
		// Initialize webfonts
		var mediawikiFontRepository = $.webfonts.repository;

		mediawikiFontRepository.base = mw.config.get( 'wgULSFontRepositoryBasePath' );

		// MediaWiki specific overrides for jquery.webfonts
		$.extend( $.fn.webfonts.defaults, {
			repository: mediawikiFontRepository,
			fontStack: $( 'body' ).css( 'font-family' ).split( /, /g ),
			/**
			 * Returns a suitable font from font repository based
			 * on the given language and html classes and user preference.
			 *
			 * @param {Object} repository
			 * @param {string} language
			 * @param {string[]} classes
			 * @return {string|null}
			 */
			fontSelector: function ( repository, language, classes ) {
				var font, defaultFont;

				if ( !language ) {
					return null;
				}

				defaultFont = repository.defaultFont( language );

				if ( classes && classes.indexOf( 'autonym' ) >= 0 ) {
					// Do not load font for showing autonym.
					return null;
				}

				// If the user has a font preference, apply it always.
				font = mw.webfonts.preferences.getFont( language ) || defaultFont;
				if ( !font || font === 'system' ) {
					// Avoid setting 'system' as a font in css
					return null;
				}

				return font;
			},

			exclude: ( function () {
				var excludes = mw.config.get( 'wgULSNoWebfontsSelectors' ).join( ', ' );

				if ( mw.user.options.get( 'editfont' ) !== 'default' ) {
					// Exclude textboxes from webfonts if the user has edit area font option
					// set using 'Preferences' page
					excludes = excludes ? excludes + ',textarea' : 'textarea';
				}

				return excludes;
			}() ),
			overridableFontFamilies: ( function () {
				var headingFont = $( 'h1' ).css( 'font-family' );
				return headingFont ? [ headingFont ] : [];
			}() )
		} );

		// Execute after task queue is processed so that the rendering is complete.
		// This is important because webfonts behavior depends on the font-family
		// property values set by stylesheets.
		setTimeout( function () {
			$( 'body' ).webfonts();
		}, 0 );
	};

	$( function () {
		mw.webfonts.preferences.load();

		if ( mw.webfonts.preferences.isEnabled() ) {
			mw.loader.using( 'ext.uls.webfonts.fonts', mw.webfonts.setup );
		}
	} );

}() );
