/*!
 * ULS - jQuery IME integration
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

	const getULSPreferences = require( 'ext.uls.preferences' ),
		languageSettingsModules = [ 'ext.uls.displaysettings', '@wikimedia/codex' ];

	const mwImeRulesPath = mw.config.get( 'wgExtensionAssetsPath' ) +
		'/UniversalLanguageSelector/lib/jquery.ime/';
	const inputSelector = 'input:not([type]), input[type=text], input[type=search], textarea, [contenteditable]';

	let inputPreferences = getULSPreferences();

	mw.ime = mw.ime || {};

	mw.ime.getLanguagesWithIME = function () {
		const ulsLanguages = mw.config.get( 'wgULSLanguages' ) || {},
			availableLanguages = {};

		for ( const language in $.ime.languages ) {
			availableLanguages[ language ] = ulsLanguages[ language ] ||
				$.uls.data.getAutonym( language );
		}

		return availableLanguages;
	};

	mw.ime.getIMELanguageList = function () {
		const unique = [];

		const previousIMELanguages = $.ime.preferences.getPreviousLanguages() || [];
		const imeLanguageList = previousIMELanguages.concat( mw.uls.getFrequentLanguageList() );

		imeLanguageList.forEach( ( lang ) => {
			if ( !unique.includes( lang ) ) {
				unique.push( lang );
			}
		} );

		return unique.slice( 0, 6 );
	};

	const ulsIMEPreferences = {

		save: function ( callback ) {
			if ( !this.registry.isDirty ) {
				if ( callback ) {
					callback.call( this, true );
				}

				return;
			}
			// we don't want to save isDirty field.
			this.registry.isDirty = undefined;
			// get updated copy of preferences
			inputPreferences = getULSPreferences();
			inputPreferences.set( 'ime', this.registry );
			inputPreferences.save( callback );
			// reset the dirty bit
			this.registry.isDirty = false;
		},

		load: function () {
			this.registry = inputPreferences.get( 'ime' ) || this.registry;
			// Some validation in case the stored preferences are corrupt
			if ( typeof this.registry.language !== 'string' ) {
				this.registry.language = null;
			}
			if ( !Array.isArray( this.registry.previousLanguages ) ) {
				this.registry.previousLanguages = [];
			}
			if ( !Array.isArray( this.registry.previousInputMethods ) ) {
				this.registry.previousInputMethods = [];
			}
			if ( !$.isPlainObject( this.registry.imes ) ) {
				this.registry.imes = {};
			}
		},

		disable: function () {
			this.registry.isDirty = true;
			this.registry.enable = false;
		},

		enable: function () {
			this.registry.isDirty = true;
			this.registry.enable = true;
		},

		isEnabled: function () {
			if ( this.registry.enable === undefined ) {
				return mw.config.get( 'wgULSIMEEnabled' );
			} else {
				return this.registry.enable;
			}
		},

		getDefaultLanguage: function () {
			return mw.config.get( 'wgContentLanguage' );
		}
	};

	function imeNotification() {
		const notificationMsg = ( mw.config.get( 'wgULSPosition' ) === 'personal' ) ?
				'ext-uls-input-disable-notification-info-personal' :
				'ext-uls-input-disable-notification-info-interlanguage',
			$notification = $( '<div>' )
				.addClass( 'uls-ime-notification-bubble' )
				.append(
					$( '<div>' )
						.attr( 'data-i18n', 'ext-uls-input-disable-notification' ),
					$( '<div>' )
						.addClass( 'link' )
						.attr( 'data-i18n', 'ext-uls-input-disable-notification-undo' )
						.on( 'click', () => {
							$.ime.preferences.enable();
							$.ime.preferences.save( () => {
								mw.ime.setup();
							} );
						} ),
					$( '<div>' ).attr( 'data-i18n', notificationMsg )
				);

		mw.notify( $notification.i18n() );
	}

	// Add a 'more settings' link that takes to input settings of ULS
	const customHelpLink = function () {
		const $disableInputToolsLink = $( '<span>' )
			.addClass( 'uls-ime-disable-link' )
			.attr( 'data-i18n', 'ext-uls-input-disable' );

		const $moreSettingsLink = $( '<span>' )
			.addClass( 'uls-ime-more-settings-link' );

		// Apparently we depend on some styles which are loaded with
		// these modules. This needs refactoring.
		mw.loader.using( languageSettingsModules, () => {
			$moreSettingsLink.languagesettings( {
				defaultModule: 'input',
				onClose: () => {
					// on close of input settings, keep focus in input area.
					this.$element.trigger( 'focus' );
				},
				top: this.$element.offset().top
			} );
		} );

		// Hide the menu.
		$moreSettingsLink.on( 'click', ( e ) => {
			this.hide();
			e.stopPropagation();
		} );

		$disableInputToolsLink.i18n();

		$disableInputToolsLink.on( 'click', ( e ) => {
			$.ime.preferences.disable();
			this.hide();
			this.$imeSetting.hide();
			$.ime.preferences.save( () => {
				mw.ime.disable();
				imeNotification();
				mw.hook( 'mw.uls.ime.disable' ).fire( 'menu' );
			} );
			e.stopPropagation();
		} );

		// If the webfonts are loaded, apply webfonts to the selector
		if ( $.fn.webfonts ) {
			this.$menu.webfonts();
		}

		return $( '<div>' )
			.addClass( 'uls-ime-menu-settings-item' )
			.append( $disableInputToolsLink, $moreSettingsLink );
	};

	mw.ime.disable = function () {
		$( inputSelector ).trigger( 'destroy.ime' );
	};

	mw.ime.init = function () {
		if ( !$.ime ) {
			// jquery.ime not loaded yet.
			return;
		}
		if ( $.ime.preferences.isEnabled ) {
			// mw.ime already initialized.
			return;
		}
		// Extend the ime preference system
		Object.assign( $.ime.preferences, ulsIMEPreferences );
		// MediaWiki specific overrides for jquery.ime
		Object.assign( $.ime.defaults, {
			imePath: mwImeRulesPath
		} );

		// Load the ime preferences
		$.ime.preferences.load();

		$.fn.imeselector.Constructor.prototype.helpLink = customHelpLink;

		// Override the autonym function for the case that
		// somebody tries to select a language for which there are
		// no input methods, which is possible in MediaWiki
		$.fn.imeselector.Constructor.prototype.getAutonym = function ( languageCode ) {
			return $.uls.data.getAutonym( languageCode );
		};
	};

	/**
	 * Binds the event listeners.
	 */
	mw.ime.setup = function () {
		const imeSelectors = mw.config.get( 'wgULSImeSelectors' ).join( ', ' );

		mw.ime.init();
		$( document.body ).on( 'focus.ime', imeSelectors, function () {
			mw.ime.handleFocus( $( this ) );
		} );
	};

	/**
	 * Loads necessary dependencies, checks input for validity and
	 * adds the ime menu for elements that should have it.
	 *
	 * @param {jQuery} $input
	 * @since 2013.11
	 */
	mw.ime.handleFocus = function ( $input ) {
		if ( $input.is( '.noime' ) || $input.data( 'ime' ) ) {
			// input does not need IME or already applied
			return;
		}

		const noImeSelectors = mw.config.get( 'wgULSNoImeSelectors' ).join( ', ' );
		if ( noImeSelectors.length && $input.is( noImeSelectors ) ) {
			$input.addClass( 'noime' );

			return;
		}

		if ( !$.ime.preferences.isEnabled() ) {
			return;
		}

		if ( $input.is( '[contenteditable]' ) && !window.rangy ) {
			// For supporting content editable divs we need rangy library
			mw.loader.using( 'rangy.core', () => {
				mw.ime.addIme( $input );
			} );

			return;
		}

		mw.ime.addIme( $input );
	};

	/**
	 * Just adds ime menu to any input element.
	 *
	 * @param {jQuery} $input
	 * @since 2013.11
	 */
	mw.ime.addIme = function ( $input ) {
		$input.ime( {
			languages: mw.ime.getIMELanguageList(),
			languageSelector: function () {
				const $ulsTrigger = $( '<a>' ).text( '...' )
					.addClass( 'ime-selector-more-languages selectable-row selectable-row-item' )
					.attr( {
						title: $.i18n( 'ext-uls-input-settings-more-languages-tooltip' )
					} );
				$ulsTrigger.uls( {
					onSelect: function ( language ) {
						$input.data( 'imeselector' ).selectLanguage( language );
						$input.trigger( 'focus' );
					},
					languages: mw.ime.getLanguagesWithIME(),
					ulsPurpose: 'ime-selector',
					top: $input.offset().top
				} );

				return $ulsTrigger;
			},
			helpHandler: function ( ime ) {
				return $( '<a>' )
					.attr( {
						href: mw.msg( 'uls-ime-helppage', ime ),
						target: '_blank',
						title: $.i18n( 'ext-uls-ime-help' )
					} )
					.addClass( 'ime-perime-help' )
					.on( 'click', ( event ) => {
						event.stopPropagation();
					} );
			}
		} );

		// Some fields may be uninitialized
		const imeselector = $input.data( 'imeselector' );
		if ( imeselector ) {
			imeselector.selectLanguage( imeselector.decideLanguage() );
			imeselector.$element.on( 'setim.ime', ( event, inputMethod ) => {
				mw.hook( 'mw.uls.ime.change' ).fire( inputMethod );
			} );
		}
	};

}() );
