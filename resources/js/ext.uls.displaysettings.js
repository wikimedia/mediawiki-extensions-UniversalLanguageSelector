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

		+ '<div class="row">' // Tab switcher buttons
		+ '<div class="twelve columns uls-display-settings-tab-switcher">'
		+ '<div class="uls-button-group">'
		+ '<button id="uls-display-settings-language-tab" class="button down" data-i18n="ext-uls-display-settings-language-tab"></button>'
		+ '<button id="uls-display-settings-fonts-tab" class="button" data-i18n="ext-uls-display-settings-fonts-tab"></button>'
		+ '</div>'
		+ '</div>'
		+ '</div>'

		+ '<div class="ext-uls-sub-panel uls-display-settings-language-tab">' // Begin display language sub-panel

		// "Display language", title above the buttons row
		+ '<div class="row">'
		+ '<div class="eleven columns">'
		+ '<h4 data-i18n="ext-uls-display-settings-ui-language"></h4>'
		+ '</div>'
		+ '</div>'

		// UI languages buttons row
		+ '<div class="row">'
		+ '<div class="uls-ui-languages eleven columns">'
		+ '<p data-i18n="ext-uls-language-buttons-help"></p>'
		+ '</div>'
		+ '</div>'

		+ '</div>' // End display language section

		+ '<div class="ext-uls-sub-panel uls-display-settings-fonts-tab hide">' // Begin font settings section, hidden by default

		// "Font settings" title
		+ '<div class="row">'
		+ '<div class="twelve columns">'
		+ '<h4 data-i18n="ext-uls-display-settings-font-settings"></h4>'
		+ '</div>'
		+ '</div>'

		+ '<div id="uls-display-settings-font-selectors" class="uls-display-settings-font-selectors">'

		// Menus font selection dropdown with label
		+ '<div class="row uls-font-item uls-content-fonts">'
		+ '<div class="six columns">'
		+ '<label class="uls-font-label" id="content-font-selector-label"></label>'
		+ '</div>'
		+ '<select id="content-font-selector" class="four columns end uls-font-select"></select>'
		+ '</div>'

		// Content font selection dropdown with label
		+ '<div class="row uls-font-item uls-ui-fonts">'
		+ '<div class="six columns">'
		+ '<label class="uls-font-label" id="ui-font-selector-label"></label>'
		+ '</div>'
		+ '<select id="ui-font-selector" class="four columns end uls-font-select"></select>'
		+ '</div>'

		+ '</div>' // End font selectors

		+ '</div>' // End font settings section

		// Separator
		+ '<div class="row"></div>'

		// Apply and Cancel buttons
		+ '<div class="row language-settings-buttons">'
		+ '<div class="eleven columns">'
		+ '<button class="button uls-display-settings-cancel" data-i18n="ext-uls-language-settings-cancel"></button>'
		+ '<button class="button active blue" id="uls-displaysettings-apply" data-i18n="ext-uls-language-settings-apply" disabled></button>'
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
			this.i18n();
			this.listen();
		},

		/**
		 * Prepare the UI language selector
		 */
		prepareLanguages: function () {
			var loginUri, $loginCta,
				displaySettings = this,
				SUGGESTED_LANGUAGES_NUMBER = 3,
				anonsAllowed = mw.config.get( 'wgULSAnonCanChangeLanguage' ),
				languagesForButtons, $languages, suggestedLanguages,
				lang, i, language, $button;

			// Don't let anonymous users change interface language
			if ( !anonsAllowed && mw.user.isAnon() ) {
				loginUri = new mw.Uri();
				loginUri.query = {
					title: 'Special:UserLogin'
				};
				$loginCta = $( '<p>' )
					.attr( 'id', 'uls-display-settings-anon-log-in-cta' );

				this.$template.find( '.uls-display-settings-language-tab' )
					.empty()
					.append(
						$( '<p>' ).append(
							$( '<span>' )
								.addClass( 'uls-display-settings-anon-label' )
								.html( $.i18n( 'ext-uls-display-settings-anon-label' ) + '&#160;' ),
							$( '<span>' )
								.text( $.i18n( 'ext-uls-display-settings-anon-same-as-content' ) )
						),
						$loginCta
					);

				new mw.Api().parse( $.i18n( 'ext-uls-display-settings-anon-log-in-cta' ) )
					.done( function ( parsedCta ) {
						$loginCta.html( parsedCta );
					} );

				return;
			}

			$languages = this.$template.find( 'div.uls-ui-languages' );
			suggestedLanguages = this.frequentLanguageList()
				// Common world languages, for the case that there are
				// too few suggested languages
				.concat( [ 'en', 'zh', 'fr' ] );

			// Content language is always on the first button
			languagesForButtons = [ this.contentLanguage ];

			// This is needed when drawing the panel for the second time
			// after selecting a different language
			$languages.find( 'button' ).remove();

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
				if ( languagesForButtons.length >= SUGGESTED_LANGUAGES_NUMBER ) {
					break;
				}
			}

			function buttonHandler( button ) {
				return function () {
					displaySettings.enableApplyButton();
					displaySettings.uiLanguage = button.data( 'language' ) || displaySettings.uiLanguage;
					$( 'div.uls-ui-languages button.button' ).removeClass( 'down' );
					button.addClass( 'down' );
					displaySettings.prepareUIFonts();
					// set the language for the settings panel so that webfonts
					// are correctly applied.
					displaySettings.$template.attr( 'lang', displaySettings.uiLanguage );
					$.i18n().locale = displaySettings.uiLanguage;
					displaySettings.i18n();
				};
			}

			// Add the buttons for the most likely languages
			for ( i = 0; i < SUGGESTED_LANGUAGES_NUMBER; i++ ) {
				language = languagesForButtons[i];
				$button = $( '<button>' )
					.addClass( 'button uls-language-button' )
					.text( $.uls.data.getAutonym( language ) )
					.prop( {
						lang: language,
						dir: $.uls.data.getDir( language )
					} );

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
			var displaySettings = this,
				$languages, $moreLanguagesButton;

			$languages = this.$template.find( 'div.uls-ui-languages' );
			$moreLanguagesButton = $( '<button>' )
				.prop( 'class', 'uls-more-languages' )
				.addClass( 'button' ).text( '...' );

			$languages.append( $moreLanguagesButton );
			// Show the long language list to select a language for display settings
			$moreLanguagesButton.uls( {
				left: displaySettings.$parent.left,
				top: displaySettings.$parent.top,
				onReady: function () {
					var uls = this,
						$back = $( '<a>' )
							.data( 'i18n', 'ext-uls-back-to-display-settings' )
							.i18n();

					$back.click( function () {
						uls.hide();
						displaySettings.$parent.show();
					} );

					uls.$menu.find( 'div.uls-title-region' ).append( $back );
					uls.$menu.find( 'h1.uls-title' )
						.data( 'i18n', 'ext-uls-display-settings-ui-language' )
						.i18n();
					uls.$menu.prepend(
						$( '<span>' ).addClass( 'caret-before' ),
						$( '<span>' ).addClass( 'caret-after' )
					);
				},
				onVisible: function () {
					if ( !displaySettings.$parent.$window.hasClass( 'callout' ) ) {
						// callout menus will have position rules. others use
						// default position
						return;
					}
					var $parent = $( '#language-settings-dialog' );
					// Re-position the element according to the window that called it
					if ( parseInt( $parent.css( 'left' ), 10 ) ) {
						this.$menu.css( 'left', $parent.css( 'left' ) );
					}
					if ( parseInt( $parent.css( 'top' ), 10 ) ) {
						this.$menu.css( 'top', $parent.css( 'top' ) );
					}
					// If the ULS is shown in the the sidebar,
					// add a caret pointing to the icon
					if ( displaySettings.$parent.$window.hasClass( 'callout' ) ) {
						this.$menu.addClass( 'callout' );
					} else {
						this.$menu.removeClass( 'callout' );
					}
				},
				onSelect: function ( langCode ) {
					displaySettings.enableApplyButton();
					displaySettings.uiLanguage = langCode;
					displaySettings.$parent.show();
					displaySettings.prepareUIFonts();
					displaySettings.prepareLanguages();
					// set the language for the settings panel so that webfonts
					// are correctly applied.
					displaySettings.$template.attr( 'lang', langCode );
					$.i18n().locale = langCode;
					displaySettings.i18n();
				},
				quickList: function () {
					return mw.uls.getFrequentLanguageList();
				}
			} );

			$moreLanguagesButton.on( 'click', function () {
				displaySettings.$parent.hide();
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
			var language, fonts, $fontSelector, savedFont,
				$systemFont, $fontLabel, $fontsSection;

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

			// Get the saved font using the fontSelector defined in mw.webfonts.setup
			savedFont = this.$webfonts.getFont( language );
			$.each( fonts, function ( key, font ) {
				var $fontOption;

				if ( font !== 'system' ) {
					$fontOption = $( '<option>' ).attr( 'value', font ).text( font );
					$fontSelector.append( $fontOption );
					$fontOption.attr( 'selected', savedFont === font );
				}
			} );

			$systemFont = $( '<option>' ).val( 'system' ).text( $.i18n( 'ext-uls-webfonts-system-font' ) );
			$fontSelector.append( $systemFont );
			$systemFont.attr( 'selected', savedFont === 'system' || !savedFont );

			// Possible ids:
			// uls-ui-font-selector-label
			// uls-content-font-selector-label
			$fontLabel = this.$template.find( '#' + target + '-font-selector-label' );
			$fontLabel.empty();
			$fontLabel.append( $( '<strong>' ) );

			// Possible messages:
			// ext-uls-webfonts-select-for-ui-info
			// ext-uls-webfonts-select-for-content-info
			$fontLabel.append( $( '<div>' )
				.attr( 'data-i18n', 'ext-uls-webfonts-select-for-' + target + '-info' ) );
		},

		/**
		 * i18n this settings panel
		 */
		i18n: function () {
			this.$template.i18n();

			this.$template.find( '#ui-font-selector-label strong' )
				.text( $.i18n( 'ext-uls-webfonts-select-for', $.uls.data.getAutonym( this.uiLanguage ) ) );
			this.$template.find( '#content-font-selector-label strong' )
				.text( $.i18n( 'ext-uls-webfonts-select-for', $.uls.data.getAutonym( this.contentLanguage ) ) );
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
		 * Enable the apply button.
		 * Useful in many places when something changes.
		 */
		enableApplyButton: function () {
			this.$template.find( '#uls-displaysettings-apply' ).removeAttr( 'disabled' );
		},

		/**
		 * Register general event listeners
		 */
		listen: function () {
			var displaySettings = this,
				$contentFontSelector = this.$template.find( '#content-font-selector' ),
				$uiFontSelector = this.$template.find( '#ui-font-selector' ),
				oldUIFont = $uiFontSelector.find( 'option:selected' ).val(),
				oldContentFont = $contentFontSelector.find( 'option:selected' ).val(),
				$tabButtons = displaySettings.$template.find( '.uls-display-settings-tab-switcher button' );

			// TODO all these repeated selectors can be placed in object constructor.

			displaySettings.$template.find( '#uls-displaysettings-apply' ).on( 'click', function () {
				displaySettings.apply();
			} );

			displaySettings.$template.find( 'button.uls-display-settings-cancel' ).on( 'click', function () {
				mw.webfonts.preferences.setFont( displaySettings.contentLanguage, oldContentFont );
				mw.webfonts.preferences.setFont( displaySettings.uiLanguage, oldUIFont );

				if ( displaySettings.$webfonts ) {
					displaySettings.$webfonts.refresh();
				}

				displaySettings.$template.find( 'div.uls-ui-languages button.button' ).each( function () {
					var $button = $( this );

					if ( $button.attr( 'lang' ) === displaySettings.contentLanguage ) {
						$button.addClass( 'down' );
					} else {
						$button.removeClass( 'down' );
					}
				} );
				displaySettings.prepareUIFonts();
				displaySettings.prepareContentFonts();
				displaySettings.close();
			} );

			$uiFontSelector.on( 'change', function () {
				displaySettings.enableApplyButton();

				mw.webfonts.preferences.setFont( displaySettings.uiLanguage,
					$( this ).find( 'option:selected' ).val()
				);
				displaySettings.$webfonts.refresh();
			} );

			$contentFontSelector.on( 'change', function () {
				displaySettings.enableApplyButton();

				mw.webfonts.preferences.setFont( displaySettings.contentLanguage,
					$( this ).find( 'option:selected' ).val()
				);
				displaySettings.$webfonts.refresh();
			} );

			$tabButtons.on( 'click', function () {
				var $button = $( this );

				if ( $button.hasClass( 'down' ) ) {
					return;
				}

				displaySettings.$template.find( '.ext-uls-sub-panel' ).each( function () {
					var $subPanel = $( this );

					if ( $subPanel.hasClass( $button.attr( 'id' ) ) ) {
						$subPanel.removeClass( 'hide' );
					} else {
						$subPanel.addClass( 'hide' );
					}
				} );

				displaySettings.$parent.position();
				$tabButtons.filter( '.down' ).removeClass( 'down');
				$button.addClass( 'down' );

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
			var origUILanguage = this.getUILanguage();

			if ( $.i18n().locale !== origUILanguage ) {
				// restore UI localization for display settings panel
				$.i18n().locale = origUILanguage;
				this.i18n();
			}
			this.$parent.close();
		},

		/**
		 * Callback for save preferences
		 */
		onSave: function ( success ) {
			if ( success ) {
				if ( this.$webfonts !== undefined ) {
					// Live font update
					this.$webfonts.refresh();
				}

				this.$parent.hide();
				// we delay change UI language to here, because it causes a page refresh
				if ( this.uiLanguage !== this.getUILanguage() ) {
					mw.uls.changeLanguage( this.uiLanguage );
				}
			} // @todo What to do in case of failure?
		},

		/**
		 * Handle the apply button press
		 */
		apply: function () {
			var displaySettings = this;

			// Save the preferences
			mw.webfonts.preferences.save( function ( result ) {
				// closure for not losing the scope
				displaySettings.onSave( result );
			} );
		}
	};

	// Register this module to language settings modules
	$.fn.languagesettings.modules = $.extend( $.fn.languagesettings.modules, {
		display: DisplaySettings
	} );
}( jQuery, mediaWiki ) );
