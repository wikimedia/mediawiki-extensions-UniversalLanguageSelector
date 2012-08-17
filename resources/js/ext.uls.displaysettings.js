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

	var template = '<div class="row"><div class="twelve columns"><h3>Display Settings</h3></div></div>'
			+ '<div class="row"><div class="eleven columns"><h4>Language used for menus</h4></div></div>'
			+ '<div class="row"><div class="uls-ui-languages eleven columns">'
			+ '</div></div>'
			+ '<div class="row"><div class="twelve columns"><h4>Font Settings</h4></div></div>'
			+ '<div class="row">'
			+ '<div class="eleven columns">'
			+ '<label class="checkbox"><input type="checkbox" id="webfonts-enable-checkbox" />'
			+ '<strong>Download fonts automatically when needed</strong> '
			+ 'Web fonts will be downloaded when text in special scripts is displayed. '
			+ '<a target="_blank" href="//www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:WebFonts">More Information</a>'
			+ '</span></label>'
			+ '</div>'
			+ '</div>'
			+ '<div class="row"><h5 class="twelve columns">Select your preferred fonts</h5></div>'
			+ '<div class="row">'
			+ '<div class="six columns"><label class="uls-font-label" id="font-selector"></label></div>'
			+ '<select class="four columns end uls-font-select"></select></div>'
			+ '</div>'
			+ '<div class="row"></div>'
			+ '<div class="row language-settings-buttons">'
			+ '<div class="eleven columns">'
			+ '<button class="button uls-settings-close">Cancel</button>'
			+ '<button id="uls-displaysettings-apply" class="active blue button">Apply changes</button>'
			+ '</div>'
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
		render: function () {
			this.$parent.$settingsPanel.empty();
			this.$webfonts = $( 'body' ).data( 'webfonts' );
			this.$parent.$settingsPanel.append( this.$template );
			this.prepareLanguages();
			this.prepareFonts();
			this.prepareWebfontsCheckbox();

			this.listen();
		},

		prepareWebfontsCheckbox: function () {
			$( '#webfonts-enable-checkbox' ).prop( 'checked', this.isWebFontsEnabled() );
		},

		isWebFontsEnabled: function () {
			var enable = this.webfontPreferences.get( 'webfonts-enabled' );

			// If the user didn't use the checkbox, the preference will be undefined.
			// The default for now is to enable webfonts if the user didn't select anything.
			if ( enable === undefined ) {
				enable = true;
			}
			return enable;
		},

		/**
		 * Prepare the UI language selector
		 */
		prepareLanguages: function () {
			var that = this;
			var $languages = this.$template.find( 'div.uls-ui-languages' );
			$languages.empty();
			var previousLanguages = this.previousLanguages();
			var languages = [this.language];
			for ( var lang in previousLanguages ) {
				if ( previousLanguages[lang] === this.language ) {
					continue;
				}
				languages.push( previousLanguages[lang] );
			}

			for ( var i = 0; i < 3; i++ ) {
				var language = languages[i];
				var $button = $( '<button>' )
					.addClass( 'button uls-language-button' )
					.text( $.uls.data.autonym( language ) );
				if ( language === this.language ) {
					$button.addClass( 'down' );
				}
				$button.data( 'language', language );
				$languages.append( $button );
				$button.on ( 'click', function () {
					that.language = $( this ).data( 'language' );
				} );
			}
			this.prepareMoreLanguages();
		},

		/**
		 * Prepare the more languages button. It is a ULS trigger
		 */
		prepareMoreLanguages: function () {
			var that = this;
			var $languages = this.$template.find( 'div.uls-ui-languages' );
			var $moreLanguagesButton = $( '<button>' )
				.prop( 'id', 'uls-more-languages' )
				.addClass( 'button' ).text( '...' );

			$languages.append( $moreLanguagesButton );
			// Show the long language list to select a language for display settings
			$moreLanguagesButton.uls( {
				left: that.$parent.left,
				top: that.$parent.top,
				onReady: function( uls ) {
					var $back = $( '<a>' )
						.prop( 'href', '#' )
						.prop( 'title', 'Back to display settings' )
						.text( '← Back to display settings' ); // FIXME i18n

					$back.click( function() {
						uls.hide();
						that.$parent.show();
					} );

					uls.$menu.find( 'div.uls-title' ).append( $back );
				},
				onSelect: function( langCode ) {
					that.language = langCode;
					that.$parent.show();
					that.prepareFonts();
					that.prepareLanguages();
				}
			} );
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
		 * Prepare the font selector.
		 */
		prepareFonts: function () {
			var fonts = this.$webfonts.list( this.language );
			var $fontSelector = this.$template.find( 'select.uls-font-select' );

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

			$fontSelector.prop( "disabled", !this.isWebFontsEnabled() );

			var $systemFont = $( "<option>" ).val( 'system' ).text( 'System font' );
			$fontSelector.append( $systemFont );
			$systemFont.attr( 'selected', savedFont === 'system' || !savedFont );
			var $fontLabel = $( 'label#font-selector' );
			$fontLabel.text( "Select font for " + $.uls.data.autonym( this.language ) );
		},

		/**
		 * Get the selected font.
		 * @returns String
		 */
		selectedFont: function () {
			return this.$template.find( 'select.uls-font-select' ).find( 'option:selected' ).val();
		},

		/**
		 * Register general event listeners
		 */
		listen: function () {
			var that = this,
				$fontSelector = $( "select.uls-font-select" );

			this.$template.find( "div.uls-ui-languages button.button" ).click( function () {
				$( "div.uls-ui-languages button.button" ).removeClass( "down" );
				$( this ).addClass( "down" );
				that.language = $( this ).data( "language" ) || that.language;
				that.prepareFonts();
			} );

			this.$template.find( '#uls-displaysettings-apply' ).on( 'click', function () {
				that.apply();
			} );

			this.$template.find( '#webfonts-enable-checkbox' ).on( 'click', function () {
				if ( this.checked ) {
					$fontSelector.prop( "disabled", false );
					that.$webfonts.apply( that.selectedFont() );
				} else {
					$fontSelector.prop( "disabled", true );
					that.$webfonts.reset();
				}
			} );
			this.$template.find( 'button#uls-more-languages').on( 'click', function () {
				that.$parent.hide();
			} );

			$fontSelector.on( "change", function () {
				var font = that.selectedFont();

				// Update the font of the current display settings window
				// if the current UI language match with language selection,
				// or reset it if the system font was selected.
				if ( that.language === that.currentLanguage() ) {
					if ( font === 'system' ) {
						that.$webfonts.reset();
					} else {
						that.$webfonts.apply( font, that.$template );
					}
				}
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
			var that = this,
				font = this.selectedFont();

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
			this.webfontPreferences.set( 'webfonts-enabled',
				this.$template.find( '#webfonts-enable-checkbox' ).prop( 'checked' ) ? true : false );
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
