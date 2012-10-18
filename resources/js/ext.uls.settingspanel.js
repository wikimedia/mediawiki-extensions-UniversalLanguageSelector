/**
 * -- DRAFT --
 *
 * ULS-based generic settings panel. Common code for IME settings,
 * fonts settings, and possible other setings.
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

	function templateTopTitle( msg ) {
		// XXX Niklas: escape msg
		return '<div class="row">'
			+ '<div class="twelve columns">'
			+ '<h3 data-i18n="' + msg + '"></h3>'
			+ '</div>'
			+ '</div>';
	}

	function templateButtonsTitle( msg ) {
		return '<div class="row">'
			+ '<div class="eleven columns">'
			+ '<h4 data-i18n="' + msg + '"></h4>'
			+ '</div>'
			+ '</div>';
	}

	var templateButtonsRow = '<div class="row">'
		+ '<div class="uls-ui-languages eleven columns"></div>'
		+ '</div>',
		templateSeparator = '<div class="row"></div>';

	var templateApplyCancel( id ) {
		return '<div class="row language-settings-buttons">'
			+ '<div class="eleven columns">'
			+ '<button class="button uls-settings-close" data-i18n="ext-uls-language-settings-cancel"></button>'
			+ '<button id="' + id + '" class="active blue button" data-i18n="ext-uls-language-settings-apply"></button>'
			+ '</div>'
			+ '</div>';
	}

	function SettingsPanel( $parent, options ) {
		var template = templateTopTitle( options.topTitleMsg )
			+ templateButtonsTitle( options.buttonsTitleMsg )
			+ templateButtonsRow
			+ templateSeparator
			+ options.customTemplate
			+ templateApplyCancel( options.applyCancelId );

		this.name = $.i18n( options.nameMsg );
		this.description = $.i18n( options.descMsg );
		this.$template = $( '<div class="uls-settings-panel>' )
			.html( template );

		this.uiLanguage = this.getUILanguage();
		this.contentLanguage = this.getContentLanguage();
		this.$parent = $parent;
	}

	InputSettings.prototype = {

		Constructor: SettingsPanel,

		/**
		 * Render the module into a given target
		 */
		render: function () {
			this.$parent.$settingsPanel.empty();

			this.$parent.$settingsPanel.append( this.$template );
			this.prepareLanguages();
			this.prepareCustomPanel();
			this.listen();
		},

		/**
		 * To be overriden
		 */
		prepareCustomPanel: function () {
			return;
		}

		/**
		 * Prepare the UI language selector
		 */
		prepareLanguages: function () {
			var SUGGESTED_LANGUAGES_NUMBER = 3,
				languagesForButtons, $languages, suggestedLanguages,
				SUGGESTED_LANGUAGES_NUMBER, lang, i, language, $button;

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
				$button.on( 'click', this.buttonHandler( $button ) );
			}

			this.prepareMoreLanguages();
		},

		languageButtonHandler: function( button ) {
			var selectedLanguage = button.data( 'language' ) || this.uiLanguage;
			$( 'div.uls-ui-languages button.button' ).removeClass( 'down' );
			button.addClass( 'down' );
			this.customLanguageButton( selectedLanguage );
		},

		/**
		 * To be overriden
		 */
		customLanguageButton: function( selectedLanguage ) {
			return;
		}

		/**
		 * Prepare the more languages button. It is a ULS trigger
		 */
		prepareMoreLanguages: function () {
			var settingsPanel, $languages, $moreLanguagesButton;

			settingsPanel = this;
			$languages = this.$template.find( 'div.uls-ui-languages' );
			$moreLanguagesButton = $( '<button>' )
				.prop( 'id', 'uls-more-languages' )
				.addClass( 'button' ).text( '...' );

			$languages.append( $moreLanguagesButton );
			// Show the long language list to select a language for the settings
			$moreLanguagesButton.uls( {
				left: settingsPanel.$parent.left,
				top: settingsPanel.$parent.top,
				onReady: function ( ) {
					var uls = this,
						$back = $( '<a>' ).prop( 'href', '#' )
						.data( 'i18n', settingsPanel.options.backFromMoreLanguagesMsg )
						.i18n();

					$back.click( function () {
						uls.hide();
						settingsPanel.$parent.show();
					} );

					uls.$menu.find( 'div.uls-title' ).append( $back );
					uls.$menu.find( 'div.uls-title h1' )
						.data( 'i18n', settingsPanel.options.moreLanguagesTitleMsg )
						.i18n();
				},
				onSelect: function ( langCode ) {
					settingsPanel.uiLanguage = langCode;
					settingsPanel.$parent.show();
					settingsPanel.moreLanguagesSelectHandler( langCode );
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
		 * To be overriden
		 */
		moreLanguagesSelectHandler: function ( langCode ) {
			return;
		}

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
		 * TODO
		 */
		listen: function () {
			return;
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
				// Live feature update
				this[this.options.feature].refresh();
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
			var settingsPanel = this;

			// Save the preferences
			this[this.options.preferences].save( function ( result ) {
				// closure for not losing the scope
				settingsPanel.onSave( result );
			} );
		}
	};

	// Register this module to language settings modules
	$.fn.languagesettings.modules = $.extend( $.fn.languagesettings.modules, {
		input: InputSettings
	} );
} ) ( jQuery, mediaWiki );

