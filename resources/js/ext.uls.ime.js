/**
 * ULS - jQuery IME integration
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

	var mwImeRulesPath, inputSelector, inputPreferences;

	mwImeRulesPath = mw.config.get( 'wgExtensionAssetsPath' ) +
		'/UniversalLanguageSelector/lib/jquery.ime/';
	inputSelector = 'input:not([type]), input[type=text], input[type=search], textarea';

	inputPreferences = mw.uls.preferences();

	mw.ime = mw.ime || {};

	mw.ime.getLanguagesWithIME = function () {
		var language,
			availableLanguages = {};

		for ( language in $.ime.languages ) {
			availableLanguages[language] = mw.config.get( 'wgULSLanguages' )[language];
		}

		return availableLanguages;
	};

	mw.ime.getIMELanguageList = function () {
		var unique = [],
			imeLanguageList,
			previousIMELanguages;

		previousIMELanguages = $.ime.preferences.getPreviousLanguages() || [];
		imeLanguageList = previousIMELanguages.concat( mw.uls.getFrequentLanguageList() );

		$.each( imeLanguageList, function ( i, v ) {
			if ( $.inArray( v, unique ) === -1 ) {
				unique.push( v );
			}
		} );

		return unique.slice( 0, 6 );
	};

	// Extend the ime preference system
	$.extend( $.ime.preferences, {

		save: function ( callback ) {
			if ( !this.registry.isDirty ) {
				if ( callback ) {
					callback.call( this );
				}

				return;
			}

			inputPreferences.set( 'ime', this.registry );
			inputPreferences.save( callback );
		},

		load: function () {
			this.registry = inputPreferences.get( 'ime' ) || this.registry;
		},

		disable: function () {
			this.registry.isDirty = true;
			this.registry.enable = false;
		},

		enable: function () {
			this.registry.isDirty = true;
			this.registry.enable = true;
		},

		isEnabled: function () {
			if ( this.registry.enable === undefined ) {
				return mw.config.get( 'wgULSIMEEnabled' );
			} else {
				return this.registry.enable;
			}
		}

	} );

	// MediaWiki specific overrides for jquery.ime
	$.extend( $.ime.defaults, {
		imePath: mwImeRulesPath
	} );

	// Add a 'more setttings' link that takes to input settings of ULS
	$.fn.imeselector.Constructor.prototype.helpLink = function () {
		var $moreSettingsLink, imeselector;

		imeselector = this;

		$moreSettingsLink = $( '<a>' ).text( 'More settings' )
			.addClass( 'uls-ime-more-settings-link' )
			.attr( 'data-i18n', 'ext-uls-input-more-settings' );

		$moreSettingsLink.languagesettings( {
			defaultModule: 'input',
			onClose: function () {
				// on close of input settings, keep focus in input area.
				imeselector.$element.focus();
			},
			top: imeselector.$element.offset().top
		} );

		// Hide the menu.
		$moreSettingsLink.on( 'click', function (e) {
			imeselector.$menu.removeClass( 'open' );
			e.stopPropagation();
		} );

		$moreSettingsLink.i18n();

		return $moreSettingsLink;
	};

	mw.ime.disable = function () {
		$( inputSelector ).trigger( 'destroy.ime' );
	};

	mw.ime.setup = function () {

		$( 'body' ).on( 'focus.ime', inputSelector, function () {
			var imeselector,
				$input = $( this );

			$input.ime( {
				languages: mw.ime.getIMELanguageList(),
				languageSelector: function () {
					var $ulsTrigger;

					$ulsTrigger = $( '<a>' ).text( '...' )
						.addClass( 'ime-selector-more-languages' )
						.attr( {
							title: $.i18n( 'ext-uls-input-settings-more-languages-tooltip' )
						} );
					$ulsTrigger.uls( {
						onSelect: function ( language ) {
							$input.data( 'imeselector' ).selectLanguage( language );
							$input.focus();
						},
						lazyload: false,
						languages: mw.ime.getLanguagesWithIME(),
						top: $input.offset().top,
						left: $input.offset().left
					} );

					return $ulsTrigger;
				}
			} );

			// Some fields may be uninitialized
			imeselector = $input.data( 'imeselector' );
			if ( imeselector ) {
				imeselector.selectLanguage( $.ime.preferences.getLanguage() );
			}
		} );

	};

	$( document ).ready( function () {

		// Load the ime preferences
		$.ime.preferences.load();

		if ( $.ime.preferences.isEnabled() ) {
			mw.ime.setup();
		}

	} );


}( jQuery, mediaWiki, document ) );
