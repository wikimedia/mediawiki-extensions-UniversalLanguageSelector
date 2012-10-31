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

( function ( $, mw, undefined ) {
	'use strict';

	var template = '<div class="uls-display-settings">'
		+ '<div class="row">' // Top "Display settings" title
		+ '<div class="twelve columns">'
		+ '<h3 data-i18n="ext-uls-display-settings-title"></h3>'
		+ '</div>'
		+ '</div>'

		// "Language for display", title above the buttons row
		+ '<div class="row">'
		+ '<div class="eleven columns">'
		+ '<h4 data-i18n="ext-uls-display-settings-ui-language"></h4>'
		+ '</div>'
		+ '</div>'

		// UI languages buttons row
		+ '<div class="row">'
		+ '<div class="uls-ui-languages eleven columns"></div>'
		+ '</div>'

		// "Font settings" title
		+ '<div class="row">'
		+ '<div class="twelve columns">'
		+ '<h4 data-i18n="ext-uls-display-settings-font-settings"></h4>'
		+ '</div>'
		+ '</div>'

		// Webfonts enabling chechbox with label
		+ '<div class="row">'
		+ '<div class="eleven columns">'
		+ '<label class="checkbox">'
		+ '<input type="checkbox" id="webfonts-enable-checkbox" />'
		+ '<strong data-i18n="ext-uls-webfonts-settings-title"></strong> '
		+ '<span data-i18n="ext-uls-webfonts-settings-info"></span> '
		+ '<a target="_blank" href="//www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:WebFonts" data-i18n="ext-uls-webfonts-settings-info-link"></a>'
		+ '</label>'
		+ '</div>'
		+ '</div>'

		// Menus font selection dropdown with label
		+ '<div class="row uls-content-fonts">'
		+ '<div class="six columns">'
		+ '<label class="uls-font-label" id="content-font-selector-label"></label>'
		+ '</div>'
		+ '<select id="content-font-selector" class="four columns end uls-font-select"></select>'
		+ '</div>'

		// Content font selection dropdown with label
		+ '<div class="row uls-ui-fonts">'
		+ '<div class="six columns">'
		+ '<label class="uls-font-label" id="ui-font-selector-label"></label>'
		+ '</div>'
		+ '<select id="ui-font-selector" class="four columns end uls-font-select"></select>'
		+ '</div>'

		// Separator
		+ '<div class="row"></div>'

		// Apply and Cancel buttons
		+ '<div class="row language-settings-buttons">'
		+ '<div class="eleven columns">'
		+ '<button class="button uls-settings-close" data-i18n="ext-uls-language-settings-cancel"></button>'
		+ '<button id="uls-displaysettings-apply" class="active blue button" data-i18n="ext-uls-language-settings-apply"></button>'
		+ '</div>'
		+ '</div>'
		+ '</div>';

	function DisplaySettings( $parent ) {
		this.name = $.i18n( 'ext-uls-display-settings-title-short' );
		this.description = $.i18n( 'ext-uls-display-settings-desc' );
		this.$template = $( template );
		this.uiLanguage = this.getUILanguage();
		this.contentLanguage = this.getContentLanguage();
		this.$webfonts = null;
		this.$parent = $parent;
	}

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
			this.prepareUIFonts();
			this.prepareContentFonts();
			this.prepareWebfontsCheckbox();
			this.$template.i18n();
			this.listen();
		},

		prepareWebfontsCheckbox: function () {
			$( '#webfonts-enable-checkbox' ).prop( 'checked', this.isWebFontsEnabled() );
		},

		isWebFontsEnabled: function () {
			var enable = mw.webfonts.preferences.isEnabled();

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
			var displaySettings = this, languagesForButtons, $languages, suggestedLanguages,
				SUGGESTED_LANGUAGES_NUMBER, lang, i, language, $button;

			SUGGESTED_LANGUAGES_NUMBER = 3;
			displaySettings = this;
			$languages = this.$template.find( 'div.uls-ui-languages' );
			suggestedLanguages = this.frequentLanguageList()
				// Common world languages, for the case that there are
				// too few suggested languages
				.concat( [ 'en', 'zh', 'fr' ] );

			// Content language is always on the first button
			languagesForButtons = [ this.contentLanguage ];

			// This is needed when drawing the panel for the second time
			// after selecting a different language
			$languages.empty();

			// UI language must always be present
			if ( this.uiLanguage !== this.contentLanguage ) {
				languagesForButtons.push( this.uiLanguage );
			}

			for ( lang in suggestedLanguages ) {
				// Skip already found languages
				if ( $.inArray( suggestedLanguages[lang], languagesForButtons ) > -1 ) {
					continue;
				}

				languagesForButtons.push( suggestedLanguages[lang] );

				// No need to add more languages than buttons
				if ( languagesForButtons.length === SUGGESTED_LANGUAGES_NUMBER ) {
					break;
				}
			}

			function buttonHandler( button ) {
				return function () {
					displaySettings.uiLanguage = button.data( 'language' ) || displaySettings.uiLanguage;
					$( 'div.uls-ui-languages button.button' ).removeClass( 'down' );
					button.addClass( 'down' );
					displaySettings.prepareUIFonts();
				};
			}

			// Add the buttons for the most likely languages
			for ( i = 0; i < SUGGESTED_LANGUAGES_NUMBER; i++ ) {
				language = languagesForButtons[i];
				$button = $( '<button>' )
					.addClass( 'button uls-language-button' )
					.text( $.uls.data.getAutonym( language ) )
					.prop({
						lang: language,
						dir: $.uls.data.getDir( language )
					});

				if ( language === this.uiLanguage ) {
					$button.addClass( 'down' );
				}

				$button.data( 'language', language );
				$languages.append( $button );
				$button.on( 'click', buttonHandler( $button ) );
			}

			this.prepareMoreLanguages();
		},

		/**
		 * Prepare the more languages button. It is a ULS trigger
		 */
		prepareMoreLanguages: function () {
			var that, $languages, $moreLanguagesButton;

			that = this;
			$languages = this.$template.find( 'div.uls-ui-languages' );
			$moreLanguagesButton = $( '<button>' )
				.prop( 'id', 'uls-more-languages' )
				.addClass( 'button' ).text( '...' );

			$languages.append( $moreLanguagesButton );
			// Show the long language list to select a language for display settings
			$moreLanguagesButton.uls( {
				left: that.$parent.left,
				top: that.$parent.top,
				onReady: function ( ) {
					var uls = this,
						$back = $( '<a>' ).prop( 'href', '#' )
						.data( 'i18n','ext-uls-back-to-display-settings' )
						.i18n();

					$back.click( function () {
						uls.hide();
						that.$parent.show();
					} );

					uls.$menu.find( 'div.uls-title' ).append( $back );
					uls.$menu.find( 'div.uls-title h1' )
						.data( 'i18n','ext-uls-display-settings-ui-language' )
						.i18n();
				},
				onSelect: function ( langCode ) {
					that.uiLanguage = langCode;
					that.$parent.show();
					that.prepareUIFonts();
					that.prepareLanguages();
				},
				quickList: function () {
					return mw.uls.getFrequentLanguageList();
				}
			} );

			$moreLanguagesButton.on( 'click', function () {
				that.$parent.hide();
			} );
		},

		/**
		 * Get previous languages
		 * @returns {Array}
		 */
		frequentLanguageList: function () {
			return mw.uls.getFrequentLanguageList();
		},

		/**
		 * Get the current user interface language.
		 * @returns String Current UI language
		 */
		getUILanguage: function () {
			return mw.config.get( 'wgUserLanguage' );
		},

		/**
		 * Get the current content language.
		 * @returns String Current content language
		 */
		getContentLanguage: function () {
			return mw.config.get( 'wgContentLanguage' );
		},

		/**
		 * Prepare a font selector section with a label and a selector element.
		 *
		 * @param target String 'ui' or 'content'
		 */
		prepareFontSelector: function ( target ) {
			var language, fonts, $fontSelector, savedFont, $systemFont, $fontLabel, $fontsSection;

			// Get the language code from the right property -
			// uiLanguage or contentLanguage
			language = this[ target + 'Language' ];
			fonts = this.$webfonts.list( language );
			// Possible classes:
			// uls-ui-fonts
			// uls-content-fonts
			$fontsSection = this.$template.find( 'div.uls-' + target + '-fonts' );

			// The section may be visible from the previous time
			// the user opened the dialog, so we need to hide it.
			if ( fonts.length === 0 ) {
				$fontsSection.hide();
				return;
			}

			$fontsSection.show();
			// Possible ids:
			// uls-ui-font-selector
			// uls-content-font-selector
			$fontSelector = this.$template.find( '#' + target + '-font-selector' );

			// Remove all current fonts
			$fontSelector.find( 'option' ).remove();

			savedFont = mw.webfonts.preferences.getFont( this.uiLanguage );
			$.each( fonts, function ( key, font ) {
				if ( font !== 'system' ) {
					var $fontOption = $( '<option>' ).attr( 'value', font ).text( font );
					$fontSelector.append( $fontOption );
					$fontOption.attr( 'selected', savedFont === font );
				}
			} );

			$fontSelector.prop( 'disabled', !this.isWebFontsEnabled() );
			$systemFont = $( '<option>' ).val( 'system' ).text( 'System font' );
			$fontSelector.append( $systemFont );
			$systemFont.attr( 'selected', savedFont === 'system' || !savedFont );

			// Possible ids:
			// uls-ui-font-selector-label
			// uls-content-font-selector-label
			$fontLabel = this.$template.find( '#' + target + '-font-selector-label' );
			$fontLabel.html( '<strong>'
				+ $.i18n( 'ext-uls-webfonts-select-for', $.uls.data.getAutonym( language ) )
				+ '</strong>'
				+ '<div>'
				// Possible messages:
				// ext-uls-webfonts-select-for-ui-info
				// ext-uls-webfonts-select-for-content-info
				+ $.i18n( 'ext-uls-webfonts-select-for-' + target + '-info' )
				+ '</div>'
			);
		},

		/**
		 * Prepare the font selector for UI language.
		 */
		prepareUIFonts: function () {
			if ( this.uiLanguage === this.contentLanguage ) {
				this.$template.find( 'div.uls-ui-fonts' ).hide();
				return;
			}

			this.prepareFontSelector( 'ui' );
		},

		/**
		 * Prepare the font selector for UI language.
		 */
		prepareContentFonts: function () {
			this.prepareFontSelector( 'content' );
		},

		/**
		 * Register general event listeners
		 */
		listen: function () {
			var that = this, $contentFontSelector, $uiFontSelector;

			$contentFontSelector = this.$template
				.find( '#content-font-selector' );
			$uiFontSelector = this.$template
				.find( 'select#ui-font-selector' );
			// TODO all these repeated selectors can be placed in object constructor.

			this.$template.find( '#uls-displaysettings-apply' ).on( 'click', function () {
				that.apply();
			} );

			this.$template.find( 'button.uls-settings-close' ).on( 'click', function () {
				that.close();
			} );

			this.$template.find( '#webfonts-enable-checkbox' ).on( 'click', function () {
				if ( this.checked ) {
					mw.webfonts.preferences.enable();
					$contentFontSelector.prop( 'disabled', false );
					$uiFontSelector.prop( 'disabled', false );
					that.$webfonts.apply( $uiFontSelector.find( 'option:selected' ) );
				} else {
					mw.webfonts.preferences.disable();
					$contentFontSelector.prop( 'disabled', true );
					$uiFontSelector.prop( 'disabled', true );
					that.$webfonts.reset();
				}
			} );

			$uiFontSelector.on( 'change', function () {
				var font = $( this ).find( 'option:selected' ).val();
				mw.webfonts.preferences.setFont( that.uiLanguage, font );
				that.$webfonts.refresh();
			} );

			$contentFontSelector.on( 'change', function () {
				var font = $( this ).find( 'option:selected' ).val();
				mw.webfonts.preferences.setFont( that.contentLanguage, font );
				that.$webfonts.refresh();
			} );

		},

		/**
		 * Hide this window.
		 * Used while navigating to language selector and need coming back
		 */
		hide: function () {
			this.$parent.hide();
		},

		/**
		 * Close the language settings window.
		 * Depending on the context, actions vary.
		 */
		close: function () {
			this.$parent.close();
		},

		/**
		 * Callback for save preferences
		 */
		onSave: function ( success ) {
			if ( success ) {
				// Live font update
				this.$webfonts.refresh();
				this.$parent.hide();
				// we delay change UI language to here, because it causes a page refresh
				if ( this.uiLanguage !== this.getUILanguage() ) {
					mw.uls.changeLanguage( this.uiLanguage );
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

			// Save the preferences
			mw.webfonts.preferences.save( function ( result ) {
				// closure for not losing the scope
				that.onSave( result );
			} );
		}
	};

	// Register this module to language settings modules
	$.fn.languagesettings.modules = $.extend( $.fn.languagesettings.modules, {
		display: DisplaySettings
	} );
} ) ( jQuery, mediaWiki );

