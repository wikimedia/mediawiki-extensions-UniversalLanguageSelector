/**
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

( function ( $, mw, undefined ) {
	'use strict';

	var template = '<div class="uls-input-settings">'
		+ '<div class="row">' // Top "Display settings" title
		+ '<div class="twelve columns">'
		+ '<h3 data-i18n="ext-uls-input-settings-title"></h3>'
		+ '</div>'
		+ '</div>'

		// "Language for ime", title above the buttons row
		+ '<div class="row">'
		+ '<div class="eleven columns">'
		+ '<h4 data-i18n="ext-uls-input-settings-ui-language"></h4>'
		+ '</div>'
		+ '</div>'

		// UI languages buttons row
		+ '<div class="row">'
		+ '<div class="uls-ui-languages eleven columns"></div>'
		+ '</div>'

		// Web IMEs enabling chechbox with label
		+ '<div class="row">'
		+ '<div class="eleven columns uls-input-settings-inputmethods-list">'
		// "Input settings for language xyz" title
		+ '<h4 class="ext-uls-input-settings-imes-title"></h4>'
		+ '</div>'
		+ '</div>'

		// Separator
		+ '<div class="row"></div>'

		// Apply and Cancel buttons
		+ '<div class="row language-settings-buttons">'
		+ '<div class="eleven columns">'
		+ '<button class="button uls-input-settings-close" data-i18n="ext-uls-language-settings-cancel"></button>'
		+ '<button class="active blue button uls-input-settings-apply" data-i18n="ext-uls-language-settings-apply"></button>'
		+ '</div>'
		+ '</div>'
		+ '</div>';

	function InputSettings( $parent ) {
		this.name = $.i18n( 'ext-uls-input-settings-title-short' );
		this.description = $.i18n( 'ext-uls-input-settings-desc' );
		this.$template = $( template );
		this.imeLanguage = this.getImeLanguage();
		this.contentLanguage = this.getContentLanguage();
		this.$imes = null;
		this.$parent = $parent;
	}

	InputSettings.prototype = {

		Constructor: InputSettings,

		/**
		 * Render the module into a given target
		 */
		render: function () {
			this.$parent.$settingsPanel.empty();
			this.$imes = $( 'body' ).data( 'ime' );
			this.$parent.$settingsPanel.append( this.$template );
			this.prepareLanguages();
			this.prepareInputmethods( this.imeLanguage );
			this.$template.i18n();
			this.listen();
		},

		prepareInputmethods: function ( language ) {
			var inputsettings, $imeListContainer, defaultInputmethod, imes, selected, imeId,
				index = 0, $imeListTitle;

			imes = $.ime.languages[language];
			this.imeLanguage = language;
			$imeListTitle = this.$template.find( '.ext-uls-input-settings-imes-title' );
			$imeListContainer = this.$template.find( '.uls-input-settings-inputmethods-list' );
			$imeListContainer.find( 'label' ).remove();

			if ( !imes ) {
				$imeListTitle.text( '' );
				return;
			}

			inputsettings = this;

			$imeListTitle.text( $.i18n( 'ext-uls-input-settings-ime-settings',
				$.uls.data.getAutonym( language ) ) );

			defaultInputmethod = $.ime.preferences.getIM( language ) || imes.inputmethods[0];

			for ( index in imes.inputmethods ) {
				imeId = imes.inputmethods[index];
				selected = defaultInputmethod === imeId;
				//$.ime.load( imeId, function () {
					$imeListContainer.append( inputsettings.renderInputmethodOption( imeId,
						selected ) );
				//} );
			}

			$imeListContainer.append( inputsettings.renderInputmethodOption( 'system',
				defaultInputmethod === 'system' ) );
		},

		renderInputmethodOption: function ( imeId, selected ) {
			var $imeLabel, name, description, inputmethod, $inputMethodItem;

			$imeLabel = $( '<label>' ).attr( {
				'for': imeId,
				'class': 'imelabel'
			} );

			$inputMethodItem = $( '<input type="radio">' ).attr( {
				name: 'ime',
				id: imeId,
				value: imeId,
				checked: selected
			} );

			$imeLabel.append( $inputMethodItem );

			if ( imeId === 'system' ) {
				name = $.i18n( 'ext-uls-disable-input-method' );
				description = $.i18n( 'ext-uls-disable-input-method-desc' );
			} else {
				inputmethod = $.ime.inputmethods[imeId];
				if ( !inputmethod ) {
					// Delay in registration?
					name = $.ime.sources[imeId].name;
					description = '';
				} else {
					name = inputmethod.name;
					description = $.ime.inputmethods[imeId].description;
				}
			}

			$imeLabel.append( $( '<strong>' ).text( name ) ).append(
				$( '<span>' ).text( description ) );

			return $imeLabel;
		},

		/**
		 * Prepare the UI language selector
		 */
		prepareLanguages: function () {
			var imeSettings = this, languagesForButtons, $languages, suggestedLanguages,
				SUGGESTED_LANGUAGES_NUMBER, lang, i, language, $button;

			SUGGESTED_LANGUAGES_NUMBER = 3;
			imeSettings = this;
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
			if ( this.imeLanguage !== this.contentLanguage ) {
				languagesForButtons.push( this.imeLanguage );
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
					var selectedLanguage = button.data( 'language' ) || imeSettings.imeLanguage;

					$.ime.preferences.setLanguage( selectedLanguage );
					$( 'div.uls-ui-languages button.button' ).removeClass( 'down' );
					button.addClass( 'down' );
					imeSettings.prepareInputmethods( selectedLanguage );
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

				if ( language === this.imeLanguage ) {
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
			// Show the long language list to select a language for ime settings
			$moreLanguagesButton.uls( {
				left: that.$parent.left,
				top: that.$parent.top,
				onReady: function () {
					var uls = this,
						$back = $( '<a>' ).prop( 'href', '#' )
						.text( $.i18n( 'ext-uls-back-to-input-settings' ) );

					$back.click( function () {
						uls.hide();
						that.$parent.show();
					} );

					uls.$menu.find( 'div.uls-title' ).append( $back );
				},
				onSelect: function ( langCode ) {
					that.imeLanguage = langCode;
					that.$parent.show();
					that.prepareLanguages();
					that.prepareInputmethods( langCode );
				},
				languages: mw.ime.getLanguagesWithIME(),
				lazyload: false
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
		// XXX: Probably bad name
		getImeLanguage: function () {
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
		 * Register general event listeners
		 */
		listen: function () {
			var that = this, $imeListContainer;

			$imeListContainer = this.$template.find( '.uls-input-settings-inputmethods-list' );

			// Apply and close buttons
			this.$template.find( 'button.uls-input-settings-apply' ).on( 'click', function () {
				that.apply();
			} );

			this.$template.find( 'button.uls-input-settings-close' ).on( 'click', function () {
				that.close();
			} );

			$imeListContainer.on( 'change', 'input:radio[name=ime]:checked', function () {
				var ime = $( this ).val();

				$.ime.preferences.setLanguage( that.imeLanguage );
				$.ime.preferences.setIM( ime );
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
				// Live ime update
				this.$parent.close();
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
			$.ime.preferences.save( function ( result ) {
				// closure for not losing the scope
				that.onSave( result );
			} );
		}
	};

	// Register this module to language settings modules
	$.fn.languagesettings.modules = $.extend( $.fn.languagesettings.modules, {
		input: InputSettings
	} );

} ( jQuery, mediaWiki ) );

