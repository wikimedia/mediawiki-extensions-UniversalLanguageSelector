/**
 * ULS-based display settings panel
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

( function( $ ) {
	"use strict";

	var template = '<div class="row"><h3>Display Settings</h3></div>'
			+ '<div><h4>Language used for menus</h4></div>'
			+ '<div class="uls-ui-languages row">'
			+ '</div>'
			+ '<div class="row"><h4>Font Settings</h4></div>'
			+ '<div class="row">'
			+ '<label class="checkbox"><input type="checkbox" checked id="webfonts-enable-checkbox" />'
			+ '<strong>Download fonts automatically when needed</strong> '
			+ 'Web fonts will be downloaded when text in special scripts is displayed. '
			+ '<a href="#">More Information</a>'
			+ '</span></label>'
			+ '</div>'
			+ '<div class="row"><h5>Set your preferred fonts to use</h5></div>'
			+ '<div class="row">'
			+ '<div class="six columns"><label class="uls-font-label" id="font-selector"></label></div>'
			+ '<select class="three columns end uls-font-select"></select></div>'
			+ '</div>'
			+ '<div class="row"></div>'
			+ '<div class="row language-settings-buttons">'
			+ '<button class="three columns offset-by-three button uls-settings-close">Cancel</button>'
			+ '<button id="uls-displaysettings-apply" class="four columns offset-by-one active blue button">Apply changes</button>'
			+ '</div>'; // FIXME i18n and too much hardcoding.

	var DisplaySettings = function ( $parent ) {
		this.name = "Display";
		this.description = "Set the languages of menus and fonts";
		this.$template = $( template );
		this.language = this.currentLanguage();
		this.$webfonts = null;
		this.$parent = $parent;
		this.webfontPreferences = new $.fn.uls.preferences( 'webfonts' );
	};

	DisplaySettings.prototype = {

		Constructor: DisplaySettings,

		/**
		 * Render the module into a given target
		 */
		render: function ( ) {
			this.$parent.$settingsPanel.empty();
			this.$webfonts = $( 'body' ).data( 'webfonts' );
			this.$parent.$settingsPanel.append( this.$template );
			this.prepareLanguages();
			this.prepareFonts();
			this.listen();
		},

		/**
		 * Prepare the UI language chooser
		 */
		prepareLanguages: function () {
			var $languages = $( 'div.uls-ui-languages' );
			$languages.empty();
			var previousLanguages = this.previousLanguages();
			var languages = [this.language];
			$.merge( languages, previousLanguages);
			$.unique( languages );
			for ( var i = 0; i < 3; i++ ) {
				var language = languages[i];
				var $button = $( '<button>' )
					.addClass( 'two columns button' )
					.text( $.uls.data.autonym( language ) );
				if ( language === this.language ) {
					$button.addClass( 'down' );
				}
				if ( i > 0 ) {
					$button.addClass( 'offset-by-one' );
				}
				$button.data( 'language', language );
				$languages.append( $button );
				$button.on ( 'click', function () {
					this.language = $( this ).data( 'language' );
				} );
			}
			var $moreLanguagesButton = $( '<button>' )
				.prop( 'id', 'uls-more-languages' )
				.addClass( 'two columns offset-by-one button' )
				.text( '...' );
			$languages.append( $moreLanguagesButton );
		},

		/**
		 * Get previous languages
		 * @returns {Array}
		 */
		previousLanguages: function () {
			// FIXME
			return [ $.cookie( 'uls-previous-language' ) || 'he', 'hi', 'ml', 'ta'];
		},

		/**
		 * Get the current language.
		 * @returns String Current language
		 */
		currentLanguage: function () {
			if ( !window.mw ) {
				return navigator.language || navigator.userLanguage;
			}
			return mw.config.get( 'wgUserLanguage' );
		},

		/**
		 * Prepare the font chooser.
		 */
		prepareFonts: function () {
			var fonts = this.$webfonts.list( this.language );
			var $fontSelector = $( 'select.uls-font-select' );
			$fontSelector.find( 'option' ).remove();
			var savedFont = this.webfontPreferences.get( this.language );
			if( fonts && fonts.length ) {
				$.each( fonts, function ( key, font ) {
					var $fontOption = $( "<option>" )
					.attr( "value", font ).text( font );
					$fontSelector.append( $fontOption );
					$fontOption.attr( 'selected', savedFont === font );
				} );
			}
			var $systemFont = $( "<option>" ).val( 'system' ).text( 'System font' );
			$fontSelector.append( $systemFont );
			$systemFont.attr( 'selected', savedFont === 'system' );
			var $fontLabel = $( 'label#font-selector' );
			$fontLabel.text( "Select font for " + $.uls.data.autonym( this.language ) );
		},

		/**
		 * Register general event listeners
		 */
		listen: function () {
			var that = this;
			$( "div.uls-ui-languages button.button" ).click( function () {
				$( "button.button" ).removeClass( "down" );
				$( this ).addClass( "down" );
				that.language = $( this ).data( 'language' ) || that.language;
				that.prepareFonts();
			} );
			$( '#uls-displaysettings-apply' ).on( 'click', function () {
				that.apply();
			} );
		},

		/**
		 * Change the language of wiki using setlang URL parameter
		 * @param {String} language
		 */
		changeLanguage: function ( language ) {
			$.cookie( 'uls-previous-language', this.currentLanguage() );
			var uri = new mw.Uri( window.location.href );
			uri.extend( {
				setlang: language
			} );
			window.location.href = uri.toString();
		},

		/**
		 * Callback for save preferences
		 */
		onSave: function ( success ) {
			if ( success ) {
				this.$parent.hide();
				// we delay change UI language to here, because it causes a page refresh
				if ( this.language !== this.currentLanguage() ) {
					this.changeLanguage( this.language );
				}
			} else {
				// FIXME failure. what to do?!
			}
		},

		/**
		 * Handle the apply button press
		 */
		apply: function () {
			var that = this;
			var $fontSelector = $( 'select.uls-font-select' );
			var font = $fontSelector.find( 'option:selected' ).val();
			// Live font update if current UI language match with language selection
			if ( this.language === this.currentLanguage() ) {
				if ( font === 'system' ) {
					this.$webfonts.reset();
				} else {
					this.$webfonts.apply( font );
				}
			}
			// Save the preferences
			this.webfontPreferences.set( this.language, font );
			this.webfontPreferences.save( function ( result ) {
				// closure for not losing the scope
				that.onSave( result );
			} );
		}
	};

	// Register this module to language settings modules
	$.fn.languagesettings.modules = $.extend( $.fn.languagesettings.modules, {
		display: DisplaySettings
	} );
} ) ( jQuery );
