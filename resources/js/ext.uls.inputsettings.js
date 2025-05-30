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

( function () {
	'use strict';

	const template = '<div class="uls-input-settings">' +
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
		'<h4 class="uls-input-settings-imes-title"></h4>' +
		'</div>' +
		'</div>' +
		'</div>' +

		// Disable IME system button
		'<div class="row">' +
		'<div class="twelve columns uls-input-settings-disable-info"></div>' +
		'<div class="ten columns uls-input-settings-toggle">' +
		'<button class="cdx-button cdx-button--type-primary cdx-button--action-progressive active uls-input-toggle-button"></button>' +
		'</div>' +
		'</div>';

	function InputSettings( $parent ) {
		this.nameI18n = 'ext-uls-input-settings-title-short';
		this.descriptionI18n = 'ext-uls-input-settings-desc';
		this.$template = $( template );
		this.uiLanguage = this.getInterfaceLanguage();
		this.contentLanguage = this.getContentLanguage();
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
			const webfonts = $( document.body ).data( 'webfonts' );

			this.dirty = false;
			this.$parent.$settingsPanel.empty();
			this.$parent.$settingsPanel.append( this.$template );
			const $enabledOnly = this.$template.find( '.enabled-only' );
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
			this.$parent.enableApplyButton();
		},

		prepareInputmethods: function ( language ) {
			const imes = $.ime.languages[ language ];

			const $imeListTitle = this.$template.find( '.uls-input-settings-imes-title' );
			const $imeListContainer = this.$template.find( '.uls-input-settings-inputmethods-list' );

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

			const defaultInputmethod = $.ime.preferences.getIM( language ) ||
				imes.inputmethods[ 0 ];

			for ( const index in imes.inputmethods ) {
				const imeId = imes.inputmethods[ index ];
				const selected = defaultInputmethod === imeId;
				$imeListContainer.append( this.renderInputmethodOption( imeId,
					selected ) );
			}

			$imeListContainer.append( this.renderInputmethodOption( 'system',
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
			if ( imeId !== 'system' && !$.ime.sources[ imeId ] ) {
				// imeId not known for jquery.ime.
				// It is very rare, but still validate it.
				return $();
			}

			const $inputMethodItem = $( '<input>' ).attr( {
				type: 'radio',
				class: 'cdx-radio__input',
				name: 'ime',
				id: imeId,
				value: imeId
			} )
				.prop( 'checked', selected );

			let name, description, inputmethod, $helplink;
			if ( imeId === 'system' ) {
				name = $.i18n( 'ext-uls-disable-input-method' );
				description = '';
				$helplink = '';
			} else {
				inputmethod = $.ime.inputmethods[ imeId ];
				$helplink = $( '<a>' )
					.addClass( 'uls-ime-help' )
					.text( $.i18n( 'ext-uls-ime-help' ) )
					.attr( 'href', mw.msg( 'uls-ime-helppage', imeId ) )
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

			const $icon = $( '<span>' ).addClass( 'cdx-radio__icon' );

			const $imeLabelText = $( '<span>' )
				.addClass( 'cdx-label__label__text' )
				.append(
					$( '<strong>' )
						.addClass( 'uls-input-settings-name' )
						.text( name + ' ' ),
					$( '<span>' )
						.addClass( 'uls-input-settings-description' )
						.text( description ),
					$helplink
				);

			const $imeLabelTag = $( '<label>' )
				.attr( 'for', imeId )
				.addClass( 'cdx-label__label' )
				.append( $imeLabelText );

			const $imeLabel = $( '<div>' )
				.addClass( 'cdx-label cdx-radio__label' )
				.append( $imeLabelTag );

			// Wrap input, icon, and label inside the wrapper for Flexbox.
			const $inputWrapper = $( '<div>' )
				.addClass( 'cdx-radio__wrapper' )
				.append( $inputMethodItem, $icon, $imeLabel );

			return $( '<div>' )
				.addClass( 'cdx-radio' )
				.append( $inputWrapper );
		},

		/**
		 * Prepare the UI language selector
		 */
		prepareLanguages: function () {
			const inputSettings = this,
				SUGGESTED_LANGUAGES_NUMBER = 3;

			let selectedImeLanguage = $.ime.preferences.getLanguage();

			const $languages = this.$template.find( '.uls-ui-languages' );

			const suggestedLanguages = this.frequentLanguageList()
				// Common world languages, for the case that there are
				// too few suggested languages
				.concat( [ 'en', 'zh', 'fr' ] );

			// Content language is always on the first button

			const languagesForButtons = [ this.contentLanguage ];

			// This is needed when drawing the panel for the second time
			// after selecting a different language
			$languages.empty();

			// Selected IME language may be different, and it must be present, too
			if ( $.uls.data.languages[ selectedImeLanguage ] &&
				!languagesForButtons.includes( selectedImeLanguage )
			) {
				languagesForButtons.push( selectedImeLanguage );
			}

			// UI language must always be present
			if ( this.uiLanguage !== this.contentLanguage &&
				$.uls.data.languages[ this.uiLanguage ] &&
				!languagesForButtons.includes( this.uiLanguage ) ) {
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
					const selectedLang = button.data( 'language' );

					if ( selectedLang !== $.ime.preferences.getLanguage() ) {
						inputSettings.markDirty();
						$.ime.preferences.setLanguage( selectedLang );
					}
					// Mark the button selected
					$( '.uls-ui-languages .cdx-button' ).removeClass( 'uls-cdx-button-pressed' );
					button.addClass( 'uls-cdx-button-pressed' );
					inputSettings.prepareInputmethods( selectedLang );
				};
			}

			// In case no preference exist for IME, selected language is contentLanguage
			selectedImeLanguage = selectedImeLanguage || this.contentLanguage;
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

				$button.data( 'language', language );
				const $caret = $( '<span>' ).addClass( 'uls-input-settings-caret' );

				$languages.append( $button, $caret );

				$button.on( 'click', buttonHandler( $button ) );

				if ( language === selectedImeLanguage ) {
					$button.trigger( 'click' );
				}
			}

			this.prepareMoreLanguages();
		},

		/**
		 * Prepare the more languages button. It is a ULS trigger
		 */
		prepareMoreLanguages: function () {
			const inputSettings = this;

			const $languages = this.$template.find( '.uls-ui-languages' );
			const $moreLanguagesButton = $( '<button>' )
				.prop( 'class', 'uls-more-languages' )
				.addClass( 'cdx-button' ).text( '...' );

			$languages.append( $moreLanguagesButton );
			// Show the long language list to select a language for ime settings
			$moreLanguagesButton.uls( {
				left: inputSettings.$parent.left,
				top: inputSettings.$parent.top,
				onReady: function () {
					const $back = $( '<div>' )
						.addClass( 'uls-icon-back' )
						.data( 'i18n', 'ext-uls-back-to-input-settings' )
						.i18n()
						.text( ' ' );

					$back.on( 'click', () => {
						this.hide();
						inputSettings.$parent.show();
					} );

					const $wrap = $( '<div>' )
						.addClass( 'uls-search-wrapper-wrapper' );

					this.$menu.find( '.uls-search-wrapper' ).wrap( $wrap );
					this.$menu.find( '.uls-search-wrapper-wrapper' ).prepend( $back );

					// Copy callout related classes from parent
					// eslint-disable-next-line no-jquery/no-class-state
					this.$menu.toggleClass( 'selector-left', inputSettings.$parent.$window.hasClass( 'selector-left' ) );
					// eslint-disable-next-line no-jquery/no-class-state
					this.$menu.toggleClass( 'selector-right', inputSettings.$parent.$window.hasClass( 'selector-right' ) );
				},
				onVisible: function () {
					this.$menu.find( '.uls-languagefilter' )
						.prop( 'placeholder', $.i18n( 'ext-uls-input-settings-ui-language' ) );

					// eslint-disable-next-line no-jquery/no-class-state
					if ( !inputSettings.$parent.$window.hasClass( 'callout' ) ) {
						// callout menus will have position rules. others use
						// default position
						return;
					}

					const $parent = $( '#language-settings-dialog' );

					// Re-position the element according to the window that called it
					if ( parseInt( $parent.css( 'left' ), 10 ) ) {
						this.$menu.css( 'left', $parent.css( 'left' ) );
					}
					if ( parseInt( $parent.css( 'top' ), 10 ) ) {
						this.$menu.css( 'top', $parent.css( 'top' ) );
					}

					// eslint-disable-next-line no-jquery/no-class-state
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
				languages: mw.ime.getLanguagesWithIME(),
				ulsPurpose: 'input-settings'
			} );

			$moreLanguagesButton.on( 'click', () => {
				inputSettings.$parent.hide();
				mw.hook( 'mw.uls.ime.morelanguages' ).fire();
			} );
		},

		prepareToggleButton: function () {
			const $toggleButton = this.$template.find( '.uls-input-toggle-button' );
			const $toggleButtonDesc = this.$template
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
			const $imeListContainer = this.$template.find( '.uls-input-settings-inputmethods-list' );

			$imeListContainer.on( 'change', 'input:radio[name=ime]:checked', ( event ) => {
				this.markDirty();
				$.ime.preferences.setIM( event.target.value );
			} );

			this.$template.find( 'button.uls-input-toggle-button' )
				.on( 'click', () => {
					this.markDirty();

					if ( $.ime.preferences.isEnabled() ) {
						this.disableInputTools();
					} else {
						this.enableInputTools();
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
		 *
		 * @param {boolean} success
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
			let previousIM;
			const previousLanguage = this.savedRegistry.language,
				currentlyEnabled = $.ime.preferences.isEnabled(),
				currentLanguage = $.ime.preferences.getLanguage(),
				currentIM = $.ime.preferences.getIM( currentLanguage );

			if ( !this.dirty ) {
				// No changes to save in this module.
				return;
			}
			this.$parent.setBusy( true );

			if ( previousLanguage ) {
				previousIM = this.savedRegistry.imes[ previousLanguage ];
			}

			if ( currentLanguage !== this.savedRegistry.language ||
				currentIM !== previousIM
			) {
				mw.hook( 'mw.uls.ime.change' ).fire( currentIM );
			}

			if ( this.savedRegistry.enable !== currentlyEnabled ) {
				mw.hook( currentlyEnabled ? 'mw.uls.ime.enable' : 'mw.uls.ime.disable' )
					.fire( 'this' );
			}

			// Save the preferences
			$.ime.preferences.save( ( result ) => {
				// closure for not losing the scope
				this.onSave( result );
				this.dirty = false;
				// Update the back-up preferences for the case of canceling
				this.savedRegistry = $.extend( true, {}, $.ime.preferences.registry );
				this.$parent.setBusy( false );
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
	$.fn.languagesettings.modules = Object.assign( $.fn.languagesettings.modules, {
		input: InputSettings
	} );

}() );
