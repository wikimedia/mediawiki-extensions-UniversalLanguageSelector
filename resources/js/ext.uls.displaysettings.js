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

( function () {
	'use strict';

	const template = '<div class="uls-display-settings">' +

		// Tab switcher buttons
		'<div class="row">' +
		'<div class="twelve columns uls-display-settings-tab-switcher">' +
		'<div class="uls-button-group cdx-button-group">' +
		'<button id="uls-display-settings-language-tab" class="cdx-button uls-cdx-button-pressed" ' +
		'data-i18n="ext-uls-display-settings-language-tab"></button>' +
		'<button id="uls-display-settings-fonts-tab" class="cdx-button" data-i18n="ext-uls-display-settings-fonts-tab"></button>' +
		'</div>' +
		'</div>' +
		'</div>' +

		// Begin display language sub-panel
		'<div class="uls-sub-panel uls-display-settings-language-tab">' +

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
		'<div class="uls-sub-panel uls-display-settings-fonts-tab hide">' +

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
		'<div class="cdx-checkbox">' +
		'<input type="checkbox" id="webfonts-enable-checkbox" class="cdx-checkbox__input" />' +
		'<span class="cdx-checkbox__icon"></span>' +
		'<label class="checkbox cdx-checkbox__label" for="webfonts-enable-checkbox" >' +
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
		this.dirty = false;
	}

	DisplaySettings.prototype = {

		constructor: DisplaySettings,

		/**
		 * Loads the webfonts module sets the `webfonts` property when its safe to do so
		 *
		 * @return {jQuery.Promise}
		 */
		setupWebFonts: function () {
			const d = $.Deferred();
			mw.loader.using( [ 'ext.uls.webfonts.repository', '@wikimedia/codex' ] ).then( () => {
				if ( this.isWebFontsEnabled ) {
					mw.webfonts.setup();
				}

				// Allow the webfonts library to finish loading (hack)
				setTimeout( () => {
					this.$webfonts = $( document.body ).data( 'webfonts' );
					d.resolve();
				}, 1 );
			} );
			return d.promise();
		},
		/**
		 * Render the module into a given target
		 */
		render: function () {
			this.setupWebFonts().then( () => {
				this.renderAfterDependenciesLoaded();
			} );
		},
		/**
		 * Render the module into a given target after all
		 */
		renderAfterDependenciesLoaded: function () {
			this.$parent.$settingsPanel.empty();
			this.$parent.$settingsPanel.append( this.$template );
			this.prepareLanguages();
			this.prepareUIFonts();
			this.prepareContentFonts();
			this.prepareWebfontsCheckbox();

			// Usually this is already loaded, but when changing language it
			// might not be.
			this.preview( this.uiLanguage );
			this.listen();
		},

		prepareWebfontsCheckbox: function () {
			const webFontsEnabled = this.isWebFontsEnabled();

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
			const displaySettings = this,
				SUGGESTED_LANGUAGES_NUMBER = 3,
				anonsAllowed = mw.config.get( 'wgULSAnonCanChangeLanguage' );

			// Don't let anonymous users change interface language
			if ( !anonsAllowed && !mw.user.isNamed() ) {
				const $loginCta = $( '<p>' )
					.attr( 'id', 'uls-display-settings-anon-log-in-cta' );
				const autonym = $.uls.data.getAutonym( this.contentLanguage );

				this.$template.find( '.uls-display-settings-language-tab' )
					.empty()
					.append(
						$( '<p>' ).append(
							$( '<span>' )
								.addClass( 'uls-display-settings-anon-label' )
								.text( $.i18n( 'ext-uls-display-settings-anon-label' ) + '\u00A0' ),
							$( '<span>' )
								.text( $.i18n( 'ext-uls-display-settings-anon-same-as-content', autonym ) )
						),
						$loginCta
					);

				new mw.Api().parse( $.i18n( 'ext-uls-display-settings-anon-log-in-cta' ) )
					.done( ( parsedCta ) => {
						// The parsed CTA is HTML
						$loginCta.html( parsedCta );
						$loginCta.find( 'a' ).on( 'click', () => {
							// If EventLogging is installed and enabled for ULS, give it a
							// chance to log this event. There is no promise provided and in
							// most browsers this will use the Beacon API in the background.
							// In older browsers, this event will likely get lost.
							mw.hook( 'mw.uls.login.click' );
						} );
					} );

				return;
			}

			const $languages = this.$template.find( 'div.uls-ui-languages' );
			const suggestedLanguages = this.frequentLanguageList()
				// Common world languages, for the case that there are
				// too few suggested languages
				.concat( [ 'en', 'zh-hans', 'zh-hant', 'fr' ] );

			// Content language is always on the first button
			const languagesForButtons = [ this.contentLanguage ];

			// This is needed when drawing the panel for the second time
			// after selecting a different language
			$languages.find( 'button' ).remove();

			// UI language must always be present
			if ( this.uiLanguage !== this.contentLanguage ) {
				languagesForButtons.push( this.uiLanguage );
			}

			for ( const lang in suggestedLanguages ) {
				// Skip already found languages
				if ( languagesForButtons.includes( suggestedLanguages[ lang ] ) ) {
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
					$( 'div.uls-ui-languages button.cdx-button' ).removeClass( 'uls-cdx-button-pressed' );
					button.addClass( 'uls-cdx-button-pressed' );
					displaySettings.prepareUIFonts();
					displaySettings.preview( displaySettings.uiLanguage );
				};
			}

			// Add the buttons for the most likely languages
			for ( let i = 0; i < SUGGESTED_LANGUAGES_NUMBER; i++ ) {
				const language = languagesForButtons[ i ];
				const $button = $( '<button>' )
					.addClass( 'cdx-button uls-language-button autonym' )
					.text( $.uls.data.getAutonym( language ) )
					.prop( {
						lang: language,
						dir: $.uls.data.getDir( language )
					} );

				if ( language === this.uiLanguage ) {
					$button.addClass( 'uls-cdx-button-pressed' );
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
			const displaySettings = this;

			const $languages = this.$template.find( 'div.uls-ui-languages' );
			const $moreLanguagesButton = $( '<button>' )
				.prop( 'class', 'uls-more-languages' )
				.addClass( 'cdx-button' ).text( '...' );

			$languages.append( $moreLanguagesButton );
			// Show the long language list to select a language for display settings
			$moreLanguagesButton.uls( {
				onPosition: this.$parent.position.bind( this.$parent ),
				onReady: function () {
					const $back = $( '<div>' )
						.addClass( 'uls-icon-back' );

					$back.on( 'click', () => {
						this.hide();
						displaySettings.$parent.show();
					} );

					const $wrap = $( '<div>' )
						.addClass( 'uls-search-wrapper-wrapper' );

					this.$menu.find( '.uls-search-wrapper' ).wrap( $wrap );
					this.$menu.find( '.uls-search-wrapper-wrapper' ).prepend( $back );

					// Copy callout related classes from parent
					// eslint-disable-next-line no-jquery/no-class-state
					this.$menu.toggleClass( 'selector-left', displaySettings.$parent.$window.hasClass( 'selector-left' ) );
					// eslint-disable-next-line no-jquery/no-class-state
					this.$menu.toggleClass( 'selector-right', displaySettings.$parent.$window.hasClass( 'selector-right' ) );
				},
				onVisible: function () {
					this.$menu.find( '.uls-languagefilter' )
						.prop( 'placeholder', $.i18n( 'ext-uls-display-settings-ui-language' ) );

					// eslint-disable-next-line no-jquery/no-class-state
					if ( !displaySettings.$parent.$window.hasClass( 'callout' ) ) {
						// Callout menus will have position rules.
						// Others use the default position.
						return;
					}

					// If the ULS is shown in the sidebar,
					// add a caret pointing to the icon
					// eslint-disable-next-line no-jquery/no-class-state
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
				ulsPurpose: 'interface-language',
				quickList: function () {
					return mw.uls.getFrequentLanguageList();
				}
			} );

			$moreLanguagesButton.on( 'click', () => {
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
			// Reset the language and font for the panel.
			this.$template.attr( 'lang', language )
				.css( 'font-family', '' );
			$.i18n().locale = language;
			mw.uls.loadLocalization( language ).done( () => {
				this.i18n();
				if ( this.$webfonts ) {
					this.$webfonts.refresh();
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
			// Get the language code from the right property -
			// uiLanguage or contentLanguage
			const language = this[ target + 'Language' ];
			let fonts;
			if ( this.isWebFontsEnabled() ) {
				fonts = this.$webfonts.list( language );
			} else {
				fonts = [];
			}

			// Possible classes:
			// uls-ui-fonts
			// uls-content-fonts
			const $fontsSection = this.$template.find( 'div.uls-' + target + '-fonts' );

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
			const $fontSelector = this.$template.find( '#' + target + '-font-selector' );

			// Remove all current fonts
			$fontSelector.find( 'option' ).remove();

			// Get the saved font using the fontSelector defined in mw.webfonts.setup
			const savedFont = this.$webfonts.getFont( language );
			fonts.forEach( ( font ) => {
				if ( font !== 'system' ) {
					const $fontOption = $( '<option>' ).attr( 'value', font ).text( font );
					$fontSelector.append( $fontOption );
					$fontOption.prop( 'selected', savedFont === font );
				}
			} );

			$fontSelector.prop( 'disabled', !this.isWebFontsEnabled() );

			// Using attr() instead of data() because jquery.i18n doesn't
			// currently see latter.
			const $systemFont = $( '<option>' )
				.val( 'system' )
				.attr( 'data-i18n', 'ext-uls-webfonts-system-font' );
			$fontSelector.append( $systemFont );
			$systemFont.prop( 'selected', savedFont === 'system' || !savedFont );

			// Possible ids:
			// uls-ui-font-selector-label
			// uls-content-font-selector-label
			const $fontLabel = this.$template.find( '#' + target + '-font-selector-label' );
			$fontLabel.empty().append( $( '<strong>' ) );

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
			this.$parent.enableApplyButton();
		},

		/**
		 * Register general event listeners
		 */
		listen: function () {
			const displaySettings = this,
				$contentFontSelector = this.$template.find( '#content-font-selector' ),
				$uiFontSelector = this.$template.find( '#ui-font-selector' ),
				$tabButtons = displaySettings.$template.find( '.uls-display-settings-tab-switcher button' );

			$( '#webfonts-enable-checkbox' ).on( 'click', function () {
				const $fontSelectors = $( '#uls-display-settings-font-selectors' );

				displaySettings.markDirty();

				if ( this.checked ) {
					displaySettings.setupWebFonts().then( () => {
						mw.webfonts.preferences.enable();

						displaySettings.prepareContentFonts();
						displaySettings.prepareUIFonts();

						displaySettings.i18n();
						// eslint-disable-next-line no-jquery/no-sizzle
						displaySettings.$webfonts.apply( $uiFontSelector.find( 'option:selected' ) );
						displaySettings.$webfonts.refresh();

						$fontSelectors.removeClass( 'hide' );
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
					$( this ).val()
				);
				displaySettings.$webfonts.refresh();
			} );

			$contentFontSelector.on( 'change', function () {
				displaySettings.markDirty();
				mw.webfonts.preferences.setFont( displaySettings.contentLanguage,
					$( this ).val()
				);
				displaySettings.$webfonts.refresh();
			} );

			$tabButtons.on( 'click', function () {
				const $button = $( this );

				// eslint-disable-next-line no-jquery/no-class-state
				if ( $button.hasClass( 'uls-cdx-button-pressed' ) ) {
					return;
				}

				displaySettings.$template.find( '.uls-sub-panel' ).each( function () {
					const $subPanel = $( this );

					// eslint-disable-next-line no-jquery/no-class-state
					if ( $subPanel.hasClass( $button.attr( 'id' ) ) ) {
						$subPanel.removeClass( 'hide' );
					} else {
						$subPanel.addClass( 'hide' );
					}
				} );

				displaySettings.$parent.position();
				$tabButtons.removeClass( 'uls-cdx-button-pressed' );
				$button.addClass( 'uls-cdx-button-pressed' );
			} ).on( 'mousedown', ( event ) => {
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
		 *
		 * @param {boolean} success
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
			if ( !this.dirty ) {
				// No changes to save in this module.
				return;
			}

			this.$parent.setBusy( true );
			// Save the preferences
			mw.webfonts.preferences.save( ( result ) => {
				const newRegistry = mw.webfonts.preferences.registry,
					oldRegistry = this.savedRegistry.registry,
					newFonts = newRegistry.fonts || {},
					oldFonts = oldRegistry.fonts || {};

				const newWebfontsEnable = newRegistry.webfontsEnabled;
				let oldWebfontsEnable = oldRegistry.webfontsEnabled;
				if ( oldWebfontsEnable === undefined ) {
					oldWebfontsEnable = mw.config.get( 'wgULSWebfontsEnabled' );
				}

				if ( newWebfontsEnable !== oldWebfontsEnable ) {
					const webfontsEvent = newWebfontsEnable ?
						'mw.uls.webfonts.enable' :
						'mw.uls.webfonts.disable';
					mw.hook( webfontsEvent ).fire( 'displaysettings' );
				}

				if ( newFonts[ this.uiLanguage ] !== oldFonts[ this.uiLanguage ] ) {
					mw.hook( 'mw.uls.font.change' ).fire(
						'interface', this.uiLanguage, newFonts[ this.uiLanguage ]
					);
				}

				if ( newFonts[ this.contentLanguage ] !== oldFonts[ this.contentLanguage ] ) {
					mw.hook( 'mw.uls.font.change' ).fire(
						'content', this.contentLanguage, newFonts[ this.contentLanguage ]
					);
				}

				// closure for not losing the scope
				this.onSave( result );
				this.dirty = false;
				// Update the back-up preferences for the case of canceling
				this.savedRegistry = $.extend( true, {}, mw.webfonts.preferences );
				this.$parent.setBusy( false );
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
	$.fn.languagesettings.modules = Object.assign( $.fn.languagesettings.modules, {
		display: DisplaySettings
	} );
}() );
