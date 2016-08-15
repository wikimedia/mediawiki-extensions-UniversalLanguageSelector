/*!
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

( function ( $, mw ) {
	'use strict';

	var template = '<div class="uls-display-settings">' +

		// Tab switcher buttons
		'<div class="row">' +
		'<div class="twelve columns uls-display-settings-tab-switcher">' +
		'<div class="uls-button-group mw-ui-button-group">' +
		'<button id="uls-display-settings-language-tab" class="mw-ui-button mw-ui-pressed" ' +
		'data-i18n="ext-uls-display-settings-language-tab"></button>' +
		'<button id="uls-display-settings-fonts-tab" class="mw-ui-button" data-i18n="ext-uls-display-settings-fonts-tab"></button>' +
		'</div>' +
		'</div>' +
		'</div>' +

		// Begin display language sub-panel
		'<div class="ext-uls-sub-panel uls-display-settings-language-tab">' +

		// "Display language", title above the buttons row
		'<div class="row">' +
		'<div class="twelve columns">' +
		'<h4 data-i18n="ext-uls-display-settings-ui-language"></h4>' +
		'</div>' +
		'</div>' +

		// UI languages buttons row
		'<div class="row">' +
		'<div class="uls-ui-languages twelve columns">' +
		'<p data-i18n="ext-uls-language-buttons-help"></p>' +
		'</div>' +
		'</div>' +

		// End display language section
		'</div>' +

		// Begin font settings section, hidden by default
		'<div class="ext-uls-sub-panel uls-display-settings-fonts-tab hide">' +

		// "Font settings" title
		'<div class="row">' +
		'<div class="twelve columns">' +
		'<h4 data-i18n="ext-uls-display-settings-font-settings"></h4>' +
		'</div>' +
		'</div>' +

		'<div id="uls-display-settings-font-selectors" class="uls-display-settings-font-selectors">' +

		// Menus font selection dropdown with label
		'<div class="row uls-font-item uls-content-fonts">' +
		'<div class="six columns">' +
		'<label class="uls-font-label" id="content-font-selector-label"></label>' +
		'</div>' +
		'<select id="content-font-selector" class="four columns end uls-font-select"></select>' +
		'</div>' +

		// Content font selection dropdown with label
		'<div class="row uls-font-item uls-ui-fonts">' +
		'<div class="six columns">' +
		'<label class="uls-font-label" id="ui-font-selector-label"></label>' +
		'</div>' +
		'<select id="ui-font-selector" class="four columns end uls-font-select"></select>' +
		'</div>' +

		// End font selectors
		'</div>' +

		// Webfonts enabling checkbox with label
		'<div class="row">' +
		'<div class="twelve columns">' +
		'<div class="mw-ui-checkbox">' +
		'<input type="checkbox" id="webfonts-enable-checkbox" />' +
		'<label class="checkbox" for="webfonts-enable-checkbox" >' +
		'<strong data-i18n="ext-uls-webfonts-settings-title"></strong> ' +
		'<span data-i18n="ext-uls-webfonts-settings-info"></span> ' +
		'<a target="_blank" href="https://www.mediawiki.org/wiki/Universal_Language_Selector/WebFonts" data-i18n="ext-uls-webfonts-settings-info-link"></a>' +
		'</label>' +
		'</div>' +
		'</div>' +
		'</div>' +

		// End font settings section
		'</div>';

	function DisplaySettings( $parent ) {
		this.nameI18n = 'ext-uls-display-settings-title-short';
		this.descriptionI18n = 'ext-uls-display-settings-desc';
		this.$template = $( template );
		this.uiLanguage = this.getUILanguage();
		this.contentLanguage = this.getContentLanguage();
		this.$webfonts = null;
		this.$parent = $parent;
		this.savedRegistry = $.extend( true, {}, mw.webfonts.preferences );
	}

	DisplaySettings.prototype = {

		constructor: DisplaySettings,

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

			// Usually this is already loaded, but when changing language it
			// might not be.
			this.preview( this.uiLanguage );
			this.listen();
			this.dirty = false;
		},

		prepareWebfontsCheckbox: function () {
			var webFontsEnabled = this.isWebFontsEnabled();

			if ( !webFontsEnabled ) {
				$( '#uls-display-settings-font-selectors' ).addClass( 'hide' );
			}

			$( '#webfonts-enable-checkbox' ).prop( 'checked', webFontsEnabled );
		},

		isWebFontsEnabled: function () {
			return mw.webfonts.preferences.isEnabled();
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
				lang, i, language, $button, autonym;

			// Don't let anonymous users change interface language
			if ( !anonsAllowed && mw.user.isAnon() ) {
				loginUri = new mw.Uri();
				loginUri.query = {
					title: 'Special:UserLogin'
				};
				$loginCta = $( '<p>' )
					.attr( 'id', 'uls-display-settings-anon-log-in-cta' );
				autonym = $.uls.data.getAutonym( this.contentLanguage );

				this.$template.find( '.uls-display-settings-language-tab' )
					.empty()
					.append(
						$( '<p>' ).append(
							$( '<span>' )
								.addClass( 'uls-display-settings-anon-label' )
								// .html() is needed for correct parsing of the nbsp
								.html( $.i18n( 'ext-uls-display-settings-anon-label' ) + '&#160;' ),
							$( '<span>' )
								.text( $.i18n( 'ext-uls-display-settings-anon-same-as-content', autonym ) )
						),
						$loginCta
					);

				new mw.Api().parse( $.i18n( 'ext-uls-display-settings-anon-log-in-cta' ) )
					.done( function ( parsedCta ) {
						var deferred = new $.Deferred();

						$loginCta.html( parsedCta ); // The parsed CTA is HTML
						$loginCta.find( 'a' ).click( function ( event ) {
							event.preventDefault();
							// Because browsers navigate away when clicking a link,
							// we are overriding the normal click behavior to allow
							// the event be logged first - currently there is no
							// local queue for events. Since the hook system does not
							// allow returning values, we have this ugly hack
							// for event logging to delay the page loading if event logging
							// is enabled. The promise is passed to the hook, so that
							// if event logging is enabled, in can resole the promise
							// immediately to avoid extra delays.
							deferred.done( function () {
								window.location.href = event.target.href;
							} );

							mw.hook( 'mw.uls.login.click' ).fire( deferred );

							// Delay is zero if event logging is not enabled
							window.setTimeout( function () {
								deferred.resolve();
							}, mw.config.get( 'wgULSEventLogging' ) * 500 );
						} );
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
				if ( $.inArray( suggestedLanguages[ lang ], languagesForButtons ) > -1 ) {
					continue;
				}

				languagesForButtons.push( suggestedLanguages[ lang ] );

				// No need to add more languages than buttons
				if ( languagesForButtons.length >= SUGGESTED_LANGUAGES_NUMBER ) {
					break;
				}
			}

			function buttonHandler( button ) {
				return function () {
					displaySettings.markDirty();
					displaySettings.uiLanguage = button.data( 'language' ) || displaySettings.uiLanguage;
					$( 'div.uls-ui-languages button.mw-ui-button' ).removeClass( 'mw-ui-pressed' );
					button.addClass( 'mw-ui-pressed' );
					displaySettings.prepareUIFonts();
					displaySettings.preview( displaySettings.uiLanguage );
				};
			}

			// Add the buttons for the most likely languages
			for ( i = 0; i < SUGGESTED_LANGUAGES_NUMBER; i++ ) {
				language = languagesForButtons[ i ];
				$button = $( '<button>' )
					.addClass( 'mw-ui-button uls-language-button autonym' )
					.text( $.uls.data.getAutonym( language ) )
					.prop( {
						lang: language,
						dir: $.uls.data.getDir( language )
					} );

				if ( language === this.uiLanguage ) {
					$button.addClass( 'mw-ui-pressed' );
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
			var $languages, $moreLanguagesButton,
				displaySettings = this;

			$languages = this.$template.find( 'div.uls-ui-languages' );
			$moreLanguagesButton = $( '<button>' )
				.prop( 'class', 'uls-more-languages' )
				.addClass( 'mw-ui-button' ).text( '...' );

			$languages.append( $moreLanguagesButton );
			// Show the long language list to select a language for display settings
			$moreLanguagesButton.uls( {
				left: displaySettings.$parent.left,
				top: displaySettings.$parent.top,
				onReady: function () {
					var  $wrap,
						uls = this,
						$back = $( '<div>' )
							.addClass( 'uls-icon-back' );

					$back.click( function () {
						uls.hide();
						displaySettings.$parent.show();
					} );

					$wrap = $( '<div>' )
						.addClass( 'uls-search-wrapper-wrapper' );

					uls.$menu.find( '.uls-search-wrapper' ).wrap( $wrap );
					uls.$menu.find( '.uls-search-wrapper-wrapper' ).prepend( $back );

					uls.$menu.prepend(
						$( '<span>' ).addClass( 'caret-before' ),
						$( '<span>' ).addClass( 'caret-after' )
					);
				},
				onVisible: function () {
					var $parent;

					this.$menu.find( '.uls-languagefilter' )
						.prop( 'placeholder', $.i18n( 'ext-uls-display-settings-ui-language' ) );

					if ( !displaySettings.$parent.$window.hasClass( 'callout' ) ) {
						// Callout menus will have position rules.
						// Others use the default position.
						return;
					}

					$parent = $( '#language-settings-dialog' );

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
						this.$menu.addClass( 'callout callout--languageselection' );
					} else {
						this.$menu.removeClass( 'callout' );
					}
				},
				onSelect: function ( langCode ) {
					displaySettings.uiLanguage = langCode;
					displaySettings.$template.attr( 'lang', langCode );
					// This re-renders the whole thing
					displaySettings.$parent.show();
					// And the only thing we need to take care of is to enable
					// the apply button
					displaySettings.markDirty();
				},
				quickList: function () {
					return mw.uls.getFrequentLanguageList();
				}
			} );

			$moreLanguagesButton.on( 'click', function () {
				displaySettings.$parent.hide();
				mw.hook( 'mw.uls.interface.morelanguages' ).fire();
			} );
		},

		/**
		 * Preview the settings panel in the given language
		 *
		 * @param {string} language Language code
		 */
		preview: function ( language ) {
			var displaySettings = this;

			// Reset the language and font for the panel.
			this.$template.attr( 'lang', language )
				.css( 'font-family', '' );
			$.i18n().locale = language;
			mw.uls.loadLocalization( language ).done( function () {
				displaySettings.i18n();
				if ( displaySettings.$webfonts ) {
					displaySettings.$webfonts.refresh();
				}
			} );
		},

		/**
		 * Get previous languages
		 *
		 * @return {Array}
		 */
		frequentLanguageList: function () {
			return mw.uls.getFrequentLanguageList();
		},

		/**
		 * Get the current user interface language.
		 *
		 * @return {string} Current UI language
		 */
		getUILanguage: function () {
			return mw.config.get( 'wgUserLanguage' );
		},

		/**
		 * Get the current content language.
		 *
		 * @return {string} Current content language
		 */
		getContentLanguage: function () {
			return mw.config.get( 'wgContentLanguage' );
		},

		/**
		 * Prepare a font selector section with a label and a selector element.
		 *
		 * @param {string} target 'ui' or 'content'
		 */
		prepareFontSelector: function ( target ) {
			var language, fonts, $fontSelector, savedFont,
				$systemFont, $fontLabel, $fontsSection;

			// Get the language code from the right property -
			// uiLanguage or contentLanguage
			language = this[ target + 'Language' ];
			if ( this.isWebFontsEnabled() ) {
				fonts = this.$webfonts.list( language );
			} else {
				fonts = [];
			}

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
					$fontOption.prop( 'selected', savedFont === font );
				}
			} );

			$fontSelector.prop( 'disabled', !this.isWebFontsEnabled() );

			// Using attr() instead of data() because jquery.i18n doesn't
			// currently see latter.
			$systemFont = $( '<option>' )
				.val( 'system' )
				.attr( 'data-i18n', 'ext-uls-webfonts-system-font' );
			$fontSelector.append( $systemFont );
			$systemFont.prop( 'selected', savedFont === 'system' || !savedFont );

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
			this.$parent.i18n();
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
		 * Mark dirty, there are unsaved changes. Enable the apply button.
		 * Useful in many places when something changes.
		 */
		markDirty: function () {
			this.dirty = true;
			this.$parent.$window.find( 'button.uls-settings-apply' ).prop( 'disabled', false );
		},

		/**
		 * Register general event listeners
		 */
		listen: function () {
			var displaySettings = this,
				$contentFontSelector = this.$template.find( '#content-font-selector' ),
				$uiFontSelector = this.$template.find( '#ui-font-selector' ),
				$tabButtons = displaySettings.$template.find( '.uls-display-settings-tab-switcher button' );

			$( '#webfonts-enable-checkbox' ).on( 'click', function () {
				var $fontSelectors = $( '#uls-display-settings-font-selectors' );

				displaySettings.markDirty();

				if ( this.checked ) {
					mw.loader.using( 'ext.uls.webfonts.fonts', function () {
						mw.webfonts.setup();

						// Allow the webfonts library to finish loading
						setTimeout( function () {
							displaySettings.$webfonts = $( 'body' ).data( 'webfonts' );

							mw.webfonts.preferences.enable();

							displaySettings.prepareContentFonts();
							displaySettings.prepareUIFonts();

							displaySettings.i18n();
							displaySettings.$webfonts.apply( $uiFontSelector.find( 'option:selected' ) );
							displaySettings.$webfonts.refresh();

							$fontSelectors.removeClass( 'hide' );
						}, 1 );
					} );
				} else {
					$fontSelectors.addClass( 'hide' );
					mw.webfonts.preferences.disable();
					mw.webfonts.preferences.setFont( displaySettings.uiLanguage, 'system' );
					displaySettings.$webfonts.refresh();

					$contentFontSelector.prop( 'disabled', true );
					$uiFontSelector.prop( 'disabled', true );
				}
			} );

			$uiFontSelector.on( 'change', function () {
				displaySettings.markDirty();
				mw.webfonts.preferences.setFont( displaySettings.uiLanguage,
					$( this ).find( 'option:selected' ).val()
				);
				displaySettings.$webfonts.refresh();
			} );

			$contentFontSelector.on( 'change', function () {
				displaySettings.markDirty();
				mw.webfonts.preferences.setFont( displaySettings.contentLanguage,
					$( this ).find( 'option:selected' ).val()
				);
				displaySettings.$webfonts.refresh();
			} );

			$tabButtons.on( 'click', function () {
				var $button = $( this );

				if ( $button.hasClass( 'mw-ui-pressed' ) ) {
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
				$tabButtons.removeClass( 'mw-ui-pressed' );
				$button.addClass( 'mw-ui-pressed' );
			} ).on( 'mousedown', function ( event ) {
				// Avoid taking focus, to avoid bad looking focus styles
				event.preventDefault();
			} );

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
				if ( this.$webfonts ) {
					// Live font update
					this.$webfonts.refresh();
				}

				this.$parent.hide();
				// we delay change UI language to here, because it causes a page refresh
				if ( this.uiLanguage !== this.getUILanguage() ) {
					mw.uls.changeLanguage( this.uiLanguage );
				}
				// Disable apply button
				this.$parent.disableApplyButton();
			} // @todo What to do in case of failure?
		},

		/**
		 * Handle the apply button press.
		 * Note that the button press may not be from the input settings module.
		 * For example, a user can change input settings and then go to display settings panel,
		 * do some changes and press apply button there. That press is applicable for all
		 * modules.
		 */
		apply: function () {
			var displaySettings = this;

			if ( !displaySettings.dirty ) {
				// No changes to save in this module.
				return;
			}

			displaySettings.$parent.setBusy( true );
			// Save the preferences
			mw.webfonts.preferences.save( function ( result ) {
				var newWebfontsEnable, oldWebfontsEnable, webfontsEvent,
					newRegistry = mw.webfonts.preferences.registry,
					oldRegistry = displaySettings.savedRegistry.registry,
					newFonts = newRegistry.fonts || {},
					oldFonts = oldRegistry.fonts || {};

				newWebfontsEnable = newRegistry.webfontsEnabled;
				oldWebfontsEnable = oldRegistry.webfontsEnabled;
				if ( oldWebfontsEnable === undefined ) {
					oldWebfontsEnable = mw.config.get( 'wgULSWebfontsEnabled' );
				}

				if ( newWebfontsEnable !== oldWebfontsEnable ) {
					webfontsEvent = newWebfontsEnable ?
						'mw.uls.webfonts.enable' :
						'mw.uls.webfonts.disable';
					mw.hook( webfontsEvent ).fire( 'displaysettings' );
				}

				if ( newFonts[ displaySettings.uiLanguage ] !== oldFonts[ displaySettings.uiLanguage ] ) {
					mw.hook( 'mw.uls.font.change' ).fire(
						'interface', displaySettings.uiLanguage, newFonts[ displaySettings.uiLanguage ]
					);
				}

				if ( newFonts[ displaySettings.contentLanguage ] !== oldFonts[ displaySettings.contentLanguage ] ) {
					mw.hook( 'mw.uls.font.change' ).fire(
						'content', displaySettings.contentLanguage, newFonts[ displaySettings.contentLanguage ]
					);
				}

				// closure for not losing the scope
				displaySettings.onSave( result );
				displaySettings.dirty = false;
				// Update the back-up preferences for the case of canceling
				displaySettings.savedRegistry = $.extend( true, {}, mw.webfonts.preferences );
				displaySettings.$parent.setBusy( false );
			} );
		},

		/**
		 * Cancel the changes done by user for display settings
		 */
		cancel: function () {
			if ( !this.dirty ) {
				this.close();
				return;
			}
			// Reload preferences
			mw.webfonts.preferences = $.extend( true, {}, this.savedRegistry );

			// Restore fonts
			if ( this.$webfonts ) {
				this.$webfonts.refresh();
			}

			// Restore content and UI language
			this.uiLanguage = this.getUILanguage();
			this.contentLanguage = this.getContentLanguage();

			this.close();
		}
	};

	// Register this module to language settings modules
	$.fn.languagesettings.modules = $.extend( $.fn.languagesettings.modules, {
		display: DisplaySettings
	} );
}( jQuery, mediaWiki ) );
