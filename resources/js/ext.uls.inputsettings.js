/*!
 * ULS-based ime settings panel
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

	var template = '<div class="uls-input-settings">' +
		// Top "Display settings" title
		'<div class="row">' +
		'<div class="twelve columns">' +
		'<h3 data-i18n="ext-uls-input-settings-title"></h3>' +
		'</div>' +
		'</div>' +

		// "Language for ime", title above the buttons row
		'<div class="row enabled-only uls-input-settings-languages-title">' +
		'<div class="twelve columns">' +
		'<h4 data-i18n="ext-uls-input-settings-ui-language"></h4>' +
		'</div>' +
		'</div>' +

		// UI languages buttons row
		'<div class="row enabled-only">' +
		'<div class="uls-ui-languages twelve columns"></div>' +
		'</div>' +

		// Web IMEs enabling chechbox with label
		'<div class="row enabled-only">' +
		'<div class="twelve columns">' +
		'<div class="uls-input-settings-inputmethods-list">' +
		// "Input settings for language xyz" title
		'<h4 class="ext-uls-input-settings-imes-title"></h4>' +
		'</div>' +
		'</div>' +
		'</div>' +

		// Disable IME system button
		'<div class="row">' +
		'<div class="twelve columns uls-input-settings-disable-info"></div>' +
		'<div class="ten columns uls-input-settings-toggle">' +
		'<button class="active mw-ui-constructive mw-ui-button uls-input-toggle-button"></button>' +
		'</div>' +
		'</div>';

	function InputSettings( $parent ) {
		this.nameI18n = 'ext-uls-input-settings-title-short';
		this.descriptionI18n = 'ext-uls-input-settings-desc';
		this.$template = $( template );
		this.uiLanguage = this.getInterfaceLanguage();
		this.contentLanguage = this.getContentLanguage();
		this.$imes = null;
		this.$parent = $parent;
		// ime system is lazy loaded, make sure it is initialized
		mw.ime.init();
		this.savedRegistry = $.extend( true, {}, $.ime.preferences.registry );
	}

	InputSettings.prototype = {

		constructor: InputSettings,

		/**
		 * Render the module into a given target
		 */
		render: function () {
			var $enabledOnly,
				webfonts = $( 'body' ).data( 'webfonts' );

			this.dirty = false;
			this.$parent.$settingsPanel.empty();
			this.$imes = $( 'body' ).data( 'ime' );
			this.$parent.$settingsPanel.append( this.$template );
			$enabledOnly = this.$template.find( '.enabled-only' );
			if ( $.ime.preferences.isEnabled() ) {
				$enabledOnly.removeClass( 'hide' );
			} else {
				// Hide the language list and ime selector
				$enabledOnly.addClass( 'hide' );
			}

			this.prepareLanguages();
			this.prepareToggleButton();
			this.$parent.i18n();

			if ( webfonts ) {
				webfonts.refresh();
			}

			this.listen();
		},

		/**
		 * Mark dirty, there are unsaved changes. Enable the apply button.
		 * Useful in many places when something changes.
		 */
		markDirty: function () {
			this.dirty = true;
			this.$parent.$window.find( 'button.uls-settings-apply' ).prop( 'disabled', false );
		},

		prepareInputmethods: function ( language ) {
			var index, inputSettings, $imeListContainer, defaultInputmethod,
				imes, selected, imeId, $imeListTitle;

			imes = $.ime.languages[ language ];

			$imeListTitle = this.$template.find( '.ext-uls-input-settings-imes-title' );
			$imeListContainer = this.$template.find( '.uls-input-settings-inputmethods-list' );

			$imeListContainer.empty();

			if ( !imes ) {
				$imeListContainer.append( $( '<label>' )
					.addClass( 'uls-input-settings-no-inputmethods' )
					.text( $.i18n( 'ext-uls-input-settings-noime' ) ) );
				$imeListTitle.text( '' );
				return;
			}

			$imeListTitle.text( $.i18n( 'ext-uls-input-settings-ime-settings',
				$.uls.data.getAutonym( language ) ) );

			inputSettings = this;

			defaultInputmethod = $.ime.preferences.getIM( language ) || imes.inputmethods[ 0 ];

			for ( index in imes.inputmethods ) {
				imeId = imes.inputmethods[ index ];
				selected = defaultInputmethod === imeId;
				$imeListContainer.append( inputSettings.renderInputmethodOption( imeId,
					selected ) );
			}

			$imeListContainer.append( inputSettings.renderInputmethodOption( 'system',
				defaultInputmethod === 'system' ) );

			// Added input methods may increase the height of window. Make sure
			// the entire window is in view port
			this.$parent.position();
		},

		/**
		 * For the given input method id, render the selection option.
		 *
		 * @param {string} imeId Input method id
		 * @param {boolean} selected Whether the input is the currently selected one.
		 * @return {Object} jQuery object corresponding to the input method item.
		 */
		renderInputmethodOption: function ( imeId, selected ) {
			var $imeLabel, name, description, $helplink, inputmethod, $inputMethodItem;

			if ( imeId !== 'system' && !$.ime.sources[ imeId ] ) {
				// imeId not known for jquery.ime.
				// It is very rare, but still validate it.
				return $();
			}

			$imeLabel = $( '<label>' ).attr( 'for', imeId );

			$inputMethodItem = $( '<input type="radio">' ).attr( {
				name: 'ime',
				id: imeId,
				value: imeId
			} )
			.prop( 'checked', selected );

			if ( imeId === 'system' ) {
				name = $.i18n( 'ext-uls-disable-input-method' );
				description = '';
				$helplink = '';
			} else {
				inputmethod = $.ime.inputmethods[ imeId ];
				$helplink = $( '<a>' )
					.addClass( 'uls-ime-help' )
					.text( $.i18n( 'ext-uls-ime-help' ) )
					.attr( 'href', mw.msg( 'uls-ime-helppage' ).replace( '$1', imeId ) )
					.attr( 'target', '_blank' );
				if ( !inputmethod ) {
					// The input method definition(rules) not loaded.
					// We will show the name from $.ime.sources
					name = $.ime.sources[ imeId ].name;
					description = '';
				} else {
					name = inputmethod.name;
					description = $.ime.inputmethods[ imeId ].description;
				}
			}

			$imeLabel.append(
				$( '<strong>' ).text( name ),
				$( '<span>' ).text( description ),
				$helplink
			);

			return $( '<div>' )
				.addClass( 'mw-ui-radio' )
				.append( $inputMethodItem, $imeLabel );
		},

		/**
		 * Prepare the UI language selector
		 */
		prepareLanguages: function () {
			var inputSettings = this,
				SUGGESTED_LANGUAGES_NUMBER = 3,
				selectedImeLanguage = $.ime.preferences.getLanguage(),
				languagesForButtons, $languages, suggestedLanguages,
				lang, i, language, $button, $caret;

			$languages = this.$template.find( '.uls-ui-languages' );

			suggestedLanguages = this.frequentLanguageList()
				// Common world languages, for the case that there are
				// too few suggested languages
				.concat( [ 'en', 'zh', 'fr' ] );

			// Content language is always on the first button

			languagesForButtons = [ this.contentLanguage ];

			// This is needed when drawing the panel for the second time
			// after selecting a different language
			$languages.empty();

			// Selected IME language may be different, and it must
			// be present, too
			if ( $.uls.data.languages[ selectedImeLanguage ] &&
				$.inArray( selectedImeLanguage, languagesForButtons ) === -1 ) {
				languagesForButtons.push( selectedImeLanguage );
			}

			// UI language must always be present
			if ( this.uiLanguage !== this.contentLanguage &&
				$.uls.data.languages[ this.uiLanguage ] &&
				$.inArray( this.uiLanguage, languagesForButtons ) === -1 ) {
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
					var language = button.data( 'language' );

					if ( language !== $.ime.preferences.getLanguage() ) {
						inputSettings.markDirty();
						$.ime.preferences.setLanguage( language );
					}
					// Mark the button selected
					$( '.uls-ui-languages .mw-ui-button' ).removeClass( 'mw-ui-pressed' );
					button.addClass( 'mw-ui-pressed' );
					inputSettings.prepareInputmethods( language );
				};
			}

			// In case no preference exist for IME, selected language is contentLanguage
			selectedImeLanguage = selectedImeLanguage || this.contentLanguage;
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

				$button.data( 'language', language );
				$caret = $( '<span>' ).addClass( 'uls-input-settings-caret' );

				$languages.append( $button, $caret );

				$button.on( 'click', buttonHandler( $button ) );

				if ( language === selectedImeLanguage ) {
					$button.click();
				}
			}

			this.prepareMoreLanguages();
		},

		/**
		 * Prepare the more languages button. It is a ULS trigger
		 */
		prepareMoreLanguages: function () {
			var inputSettings = this,
				$languages, $moreLanguagesButton;

			$languages = this.$template.find( '.uls-ui-languages' );
			$moreLanguagesButton = $( '<button>' )
				.prop( 'class', 'uls-more-languages' )
				.addClass( 'mw-ui-button' ).text( '...' );

			$languages.append( $moreLanguagesButton );
			// Show the long language list to select a language for ime settings
			$moreLanguagesButton.uls( {
				left: inputSettings.$parent.left,
				top: inputSettings.$parent.top,
				onReady: function () {
					var uls = this,
						$wrap,
						$back = $( '<div>' )
							.addClass( 'uls-icon-back' )
							.data( 'i18n', 'ext-uls-back-to-input-settings' )
							.i18n()
							.text( ' ' );

					$back.click( function () {
						uls.hide();
						inputSettings.$parent.show();
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
						.prop( 'placeholder', $.i18n( 'ext-uls-input-settings-ui-language' ) );

					if ( !inputSettings.$parent.$window.hasClass( 'callout' ) ) {
						// callout menus will have position rules. others use
						// default position
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

					if ( inputSettings.$parent.$window.hasClass( 'callout' ) ) {
						this.$menu.addClass( 'callout callout--languageselection' );
					} else {
						this.$menu.removeClass( 'callout' );
					}
				},
				onSelect: function ( langCode ) {
					$.ime.preferences.setLanguage( langCode );
					inputSettings.$parent.show();
					inputSettings.prepareLanguages();
					inputSettings.markDirty();
				},
				languages: mw.ime.getLanguagesWithIME()
			} );

			$moreLanguagesButton.on( 'click', function () {
				inputSettings.$parent.hide();
				mw.hook( 'mw.uls.ime.morelanguages' ).fire();
			} );
		},

		prepareToggleButton: function () {
			var $toggleButton, $toggleButtonDesc;

			$toggleButton = this.$template.find( '.uls-input-toggle-button' );
			$toggleButtonDesc = this.$template
				.find( '.uls-input-settings-disable-info' );

			if ( $.ime.preferences.isEnabled() ) {
				$toggleButton.data( 'i18n', 'ext-uls-input-disable' );
				$toggleButtonDesc.hide();
			} else {
				$toggleButton.data( 'i18n', 'ext-uls-input-enable' );
				$toggleButtonDesc.data( 'i18n', 'ext-uls-input-disable-info' ).show();
			}

			$toggleButton.i18n();
			$toggleButtonDesc.i18n();
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
		getInterfaceLanguage: function () {
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
		 * Register general event listeners
		 */
		listen: function () {
			var inputSettings = this,
				$imeListContainer;

			$imeListContainer = this.$template.find( '.uls-input-settings-inputmethods-list' );

			$imeListContainer.on( 'change', 'input:radio[name=ime]:checked', function () {
				inputSettings.markDirty();
				$.ime.preferences.setIM( $( this ).val() );
			} );

			inputSettings.$template.find( 'button.uls-input-toggle-button' )
				.on( 'click', function () {
					inputSettings.markDirty();

					if ( $.ime.preferences.isEnabled() ) {
						inputSettings.disableInputTools();
					} else {
						inputSettings.enableInputTools();
					}
				} );

		},

		/**
		 * Disable input tools
		 */
		disableInputTools: function () {
			$.ime.preferences.disable();
			mw.ime.disable();
			this.$template.find( '.enabled-only' ).addClass( 'hide' );
			this.prepareToggleButton();
		},

		/**
		 * Enable input tools
		 */
		enableInputTools: function () {
			$.ime.preferences.enable();
			mw.ime.setup();
			this.$template.find( '.enabled-only' ).removeClass( 'hide' );
			this.$template.scrollIntoView();
			this.prepareToggleButton();
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
				// Live ime update
				this.$parent.hide();
				// Disable apply button
				this.$parent.disableApplyButton();
			}
			// FIXME in case of failure. what to do?!
		},

		/**
		 * Handle the apply button press.
		 * Note that the button press may not be from the input settings module.
		 * For example, a user can change input settings and then go to display settings panel,
		 * do some changes and press apply button there. That press is applicable for all
		 * modules.
		 */
		apply: function () {
			var previousIM,
				inputSettings = this,
				previousLanguage = inputSettings.savedRegistry.language,
				currentlyEnabled = $.ime.preferences.isEnabled(),
				currentLanguage = $.ime.preferences.getLanguage(),
				currentIM = $.ime.preferences.getIM( currentLanguage );

			if ( !inputSettings.dirty ) {
				// No changes to save in this module.
				return;
			}
			inputSettings.$parent.setBusy( true );

			if ( previousLanguage ) {
				previousIM = inputSettings.savedRegistry.imes[ previousLanguage ];
			}

			if ( currentLanguage !== inputSettings.savedRegistry.language ||
				currentIM !== previousIM
			) {
				mw.hook( 'mw.uls.ime.change' ).fire( currentIM );
			}

			if ( inputSettings.savedRegistry.enable !== currentlyEnabled ) {
				mw.hook( currentlyEnabled ? 'mw.uls.ime.enable' : 'mw.uls.ime.disable' )
					.fire( 'inputsettings' );
			}

			// Save the preferences
			$.ime.preferences.save( function ( result ) {
				// closure for not losing the scope
				inputSettings.onSave( result );
				inputSettings.dirty = false;
				// Update the back-up preferences for the case of canceling
				inputSettings.savedRegistry = $.extend( true, {}, $.ime.preferences.registry );
				inputSettings.$parent.setBusy( false );
			} );
		},

		/**
		 * Cancel the changes done by user for input settings
		 */
		cancel: function () {
			if ( !this.dirty ) {
				this.close();
				return;
			}
			// Reload preferences
			$.ime.preferences.registry = $.extend( true, {}, this.savedRegistry );
			this.uiLanguage = this.getInterfaceLanguage();
			this.contentLanguage = this.getContentLanguage();
			// Restore the state of IME
			if ( $.ime.preferences.isEnabled() ) {
				mw.ime.setup();
			} else {
				mw.ime.disable();
			}
			this.close();
		}
	};

	// Register this module to language settings modules
	$.fn.languagesettings.modules = $.extend( $.fn.languagesettings.modules, {
		input: InputSettings
	} );

}( jQuery, mediaWiki ) );
