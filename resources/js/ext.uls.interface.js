/*!
 * ULS interface integration logic
 *
 * Copyright (C) 2012-2013 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
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

	// Replace with mediawiki.storage when >= MW 1.26
	var Store = function ( key ) {
		this.key = key;
	};

	// Returns null if key does not exist according to documentation.
	Store.prototype.get = function () {
		try {
			return localStorage.getItem( this.key );
		} catch ( e ) {}
	};

	Store.prototype.set = function ( value ) {
		try {
			localStorage.setItem( this.key, value );
		} catch ( e ) {}
	};

	/**
	 * Construct the display settings link
	 *
	 * @return {jQuery}
	 */
	function displaySettings() {
		var $displaySettingsTitle, displaySettingsText, $displaySettings;

		displaySettingsText = $.i18n( 'ext-uls-display-settings-desc' );
		$displaySettingsTitle = $( '<div data-i18n="ext-uls-display-settings-title">' )
			.addClass( 'settings-title' )
			.attr( 'title', displaySettingsText );
		$displaySettings = $( '<div>' )
			.addClass( 'display-settings-block' )
			.prop( 'id', 'display-settings-block' )
			.append( $displaySettingsTitle.i18n() );

		return $displaySettings;
	}

	/**
	 * Construct the input settings link
	 *
	 * @return {jQuery}
	 */
	function inputSettings() {
		var $inputSettingsTitle, inputSettingsText, $inputSettings;

		inputSettingsText = $.i18n( 'ext-uls-input-settings-desc' );
		$inputSettingsTitle = $( '<div data-i18n="ext-uls-input-settings-title">' )
			.addClass( 'settings-title' )
			.attr( 'title', inputSettingsText );
		$inputSettings = $( '<div>' )
			.addClass( 'input-settings-block' )
			.prop( 'id', 'input-settings-block' )
			.append( $inputSettingsTitle.i18n() );

		return $inputSettings;
	}

	/**
	 * Add display settings link to the settings bar in ULS
	 *
	 * @param {Object} uls The ULS object
	 */
	function addDisplaySettings( uls ) {
		var $displaySettings = displaySettings();

		uls.$menu.find( '#uls-settings-block' ).append( $displaySettings );

		// Initialize the trigger
		$displaySettings.one( 'click', function () {
			var displaySettingsOptions = {
					defaultModule: 'display'
				},
				ulsPosition = mw.config.get( 'wgULSPosition' ),
				anonMode = ( mw.user.isAnon() &&
					!mw.config.get( 'wgULSAnonCanChangeLanguage' ) );

			// If the ULS trigger is shown in the top personal menu,
			// closing the display settings must show the main ULS
			// languages list, unless we are in anon mode and thus
			// cannot show the language list
			if ( ulsPosition === 'personal' && !anonMode ) {
				displaySettingsOptions.onClose = function () {
					uls.show();
				};
			}
			$.extend( displaySettingsOptions, uls.position() );
			$displaySettings.languagesettings( displaySettingsOptions ).click();
		} );

		// On every click
		$displaySettings.on( 'click', function () {
			mw.hook( 'mw.uls.settings.open' ).fire( 'uls' );
			uls.hide();
		} );
	}

	/**
	 * Add input settings link to the settings bar in ULS
	 *
	 * @param {Object} uls The ULS object
	 */
	function addInputSettings( uls ) {
		var $inputSettings = inputSettings();

		uls.$menu.find( '#uls-settings-block' ).append( $inputSettings );

		// Initialize the trigger
		$inputSettings.one( 'click', function () {
			var position = uls.position();

			$inputSettings.languagesettings( {
				defaultModule: 'input',
				onClose: function () {
					uls.show();
				},
				top: position.top,
				left: position.left
			} ).click();
		} );

		// On every click
		$inputSettings.on( 'click', function () {
			mw.hook( 'mw.uls.settings.open' ).fire( 'uls' );
			uls.hide();
		} );
	}

	/**
	 * Helper function to make the uls triggers accessible with the keyboard.
	 *
	 * @param {jQuery} $target One or more jQuery elements.
	 * @since 2013.07
	 */
	function addAccessibilityFeatures( $target ) {
		// tabindex=0 makes it appear when tabbing targets.
		// See also http://www.w3.org/TR/wai-aria/roles#button
		$target.attr( {
			tabIndex: 0,
			role: 'button',
			'aria-haspopup': true
		} );
		// TODO:
		// * aria-pressed true/false when popup is open
		// * aria-controls to reference to the popup

		// Remove outline when clicking
		$target.click( function () {
			$( this ).css( 'outline', 'none' );
		} );
		// Allow outline to appear again if keyboard activated
		$target.blur( function () {
			$( this ).css( 'outline', '' );
		} );

		// Make Enter act the same as clicking. This has the unfortunate side
		// effect of removing the outline.
		$target.keydown( function ( event ) {
			// Enter
			if ( event.keyCode === 13 ) {
				$( this ).click();
				event.preventDefault();
				event.stopPropagation();
			}
		} );
	}

	function userCanChangeLanguage() {
		return mw.config.get( 'wgULSAnonCanChangeLanguage' ) || !mw.user.isAnon();
	}

	/**
	 * The tooltip to be shown when language changed using ULS.
	 * It also allows to undo the language selection.
	 */
	function showUndoTooltip( previousLang, previousAutonym ) {
		var $ulsTrigger, ulsPopup, offset,
			ulsPosition = mw.config.get( 'wgULSPosition' );

		$ulsTrigger = ( ulsPosition === 'interlanguage' ) ?
			$( '.uls-settings-trigger' ) :
			$( '.uls-trigger' );

		function hideTipsy() {
			ulsPopup.toggle( false );
		}

		function showTipsy( timeout ) {
			var tipsyTimer = 0;

			ulsPopup.toggle( true );
			ulsPopup.toggleClipping( false );
			// if the mouse is over the tooltip, do not hide
			$( '.tipsy' ).on( 'mouseover', function () {
				window.clearTimeout( tipsyTimer );
			} ).on( 'mouseout', function () {
				tipsyTimer = window.setTimeout( hideTipsy, timeout );
			} );

			// hide the tooltip when clicked on it
			$( '.tipsy' ).on( 'click', hideTipsy );

			// Event handler for links in the tooltip.
			// It looks like the tipsy is always created from scratch so that
			// there wont be multiple event handlers bound to same click.
			$( 'a.uls-prevlang-link' ).on( 'click.ulstipsy', function ( event ) {
				var deferred = $.Deferred();

				event.preventDefault();
				deferred.done( function () {
					mw.uls.changeLanguage( event.target.lang );
				} );

				mw.hook( 'mw.uls.language.revert' ).fire( deferred );

				// Delay is zero if event logging is not enabled
				window.setTimeout( function () {
					deferred.resolve();
				}, mw.config.get( 'wgULSEventLogging' ) * 500 );
			} );
			tipsyTimer = window.setTimeout( hideTipsy, timeout );
		}

		// remove any existing popups
		if ( ulsPopup ) {
			ulsPopup.$element.remove();
		}
		ulsPopup = new OO.ui.PopupWidget( {
			padded: true,
			width: 300,
			align: 'forwards',
			classes:  [ 'tipsy' ],
			$content: ( function () {
				var link = $( '<a>' ).text( previousAutonym )
					.attr( {
						href: '#',
						'class': 'uls-prevlang-link',
						lang: previousLang,
						// We could get dir from uls.data,
						// but we are trying to avoid loading it
						// and 'auto' is safe enough in this context.
						// T130390: must use attr
						dir: 'auto'
					} );

				// Get the html of the link by wrapping it in div first
				link = $( '<div>' ).html( link ).html();

				return $( '<p>' )
					.html(
						mw.message( 'ext-uls-undo-language-tooltip-text', '$1' )
							.escaped().replace( '$1', link )
					);
			}() )
		} );

		// Position popup
		offset = $ulsTrigger.offset();
		ulsPopup.$element.css( {
			top: offset.top + 24,
			left: offset.left + $ulsTrigger.outerWidth() / 2
		} ).appendTo( 'body' );

		// The interlanguage position needs some time to settle down
		window.setTimeout( function () {
			// Show the tipsy tooltip on page load.
			showTipsy( 6000 );
		}, 700 );

		// manually show the tooltip
		$ulsTrigger.on( 'mouseover', function () {
			// show only if the ULS panel is not shown
			if ( !$( '.uls-menu:visible' ).length ) {
				showTipsy( 3000 );
			}
		} );
	}

	function initInterface() {
		var $triggers,
			$pLang,
			$ulsTrigger = $( '.uls-trigger' ),
			rtlPage = $( 'body' ).hasClass( 'rtl' ),
			anonMode = ( mw.user.isAnon() &&
				!mw.config.get( 'wgULSAnonCanChangeLanguage' ) ),
			ulsPosition = mw.config.get( 'wgULSPosition' );

		if ( ulsPosition === 'interlanguage' ) {
			// TODO: Refactor this block
			// The interlanguage links section
			$pLang = $( '#p-lang' );
			// Add an element near the interlanguage links header
			$ulsTrigger = $( '<span>' ).addClass( 'uls-settings-trigger' );
			// Append ULS cog to languages section.
			$pLang.prepend( $ulsTrigger );
			// Take care of any other elements with this class.
			$ulsTrigger = $( '.uls-settings-trigger' );
			// Remove the dummy link, which was added to make sure that the section appears
			$pLang.find( '.uls-p-lang-dummy' ).remove();

			if ( !$pLang.find( 'div ul' ).children().length ) {
				// Replace the title of the interlanguage links area
				// if there are no interlanguage links
				$pLang.find( 'h3' )
					.text( mw.msg( 'uls-plang-title-languages' ) );
			}

			$ulsTrigger.attr( {
				title: mw.msg( 'ext-uls-select-language-settings-icon-tooltip' )
			} );

			$ulsTrigger.on( 'click', function ( e, eventParams ) {
				var languagesettings = $ulsTrigger.data( 'languagesettings' ),
					languageSettingsOptions;

				if ( languagesettings ) {
					if ( !languagesettings.shown ) {
						mw.hook( 'mw.uls.settings.open' ).fire( eventParams && eventParams.source || 'interlanguage' );
					}
				} else {
					// Initialize the Language settings window
					languageSettingsOptions = {
						defaultModule: 'display',
						onVisible: function () {
							var caretRadius, caretPosition,
								$caretBefore = $( '<span>' ).addClass( 'caret-before' ),
								$caretAfter = $( '<span>' ).addClass( 'caret-after' ),
								ulsTriggerHeight = this.$element.height(),
								ulsTriggerWidth = this.$element.width(),
								ulsTriggerOffset = this.$element.offset();

							// Add the callout caret triangle
							// pointing to the trigger icon
							this.$window.addClass( 'callout' );
							this.$window.prepend( $caretBefore, $caretAfter );

							// Calculate the positioning of the panel
							// according to the position of the trigger icon

							caretRadius = parseInt( $caretBefore.css( 'border-top-width' ), 10 );
							if ( rtlPage ) {
								this.left = ulsTriggerOffset.left - this.$window.width() - caretRadius;
							} else {
								this.left = ulsTriggerOffset.left + ulsTriggerWidth + caretRadius;
							}

							caretPosition = $caretBefore.position();

							// The top of the dialog is aligned in relation to
							// the middle of the trigger, so that middle of the
							// caret aligns with it. 2 is for border and margin.
							this.top = ulsTriggerOffset.top +
								( ulsTriggerHeight / 2 ) -
								( caretRadius + caretPosition.top + 2 );

							this.position();
						}
					};

					mw.loader.using( mw.uls.languageSettingsModules, function () {
						$ulsTrigger.languagesettings( languageSettingsOptions ).click();
					} );

					e.stopPropagation();
				}
			} );
		} else if ( anonMode ) {
			$ulsTrigger.on( 'click', function ( e, eventParams ) {
				var languagesettings = $ulsTrigger.data( 'languagesettings' );

				e.preventDefault();

				if ( languagesettings ) {
					if ( !languagesettings.shown ) {
						mw.hook( 'mw.uls.settings.open' ).fire( eventParams && eventParams.source || 'personal' );
					}
				} else {
					mw.loader.using( mw.uls.languageSettingsModules, function () {
						$ulsTrigger.languagesettings();

						$ulsTrigger.trigger( 'click', eventParams );
					} );
				}
			} );
		} else {
			$ulsTrigger.on( 'click', function ( e, eventParams ) {
				var uls = $ulsTrigger.data( 'uls' );

				e.preventDefault();

				if ( uls ) {
					if ( !uls.shown ) {
						mw.hook( 'mw.uls.settings.open' ).fire( eventParams && eventParams.source || 'personal' );
					}
				} else {
					mw.loader.using( 'ext.uls.mediawiki', function () {
						$ulsTrigger.uls( {
							quickList: function () {
								return mw.uls.getFrequentLanguageList();
							},
							onReady: function () {
								var uls = this;
								mw.loader.using( mw.uls.languageSettingsModules, function () {
									addDisplaySettings( uls );
									addInputSettings( uls );
								} );
							},
							onSelect: function ( language ) {
								mw.uls.changeLanguage( language );
							}
						} );

						// Allow styles to apply first and position to work by
						// delaying the activation after them.
						window.setTimeout( function () {
							$ulsTrigger.trigger( 'click', eventParams );
						}, 0 );
					} );
				}
			} );
		}

		// At this point we don't care which kind of trigger it is
		$triggers = $( '.uls-settings-trigger, .uls-trigger' );
		addAccessibilityFeatures( $triggers );

		// Bind language settings to preferences page link
		$( '#uls-preferences-link' )
			.text( mw.msg( 'ext-uls-language-settings-preferences-link' ) )
			.click( function () {
				$ulsTrigger.trigger( 'click', {
					source: 'preferences'
				} );

				return false;
			} );
	}

	function initTooltip() {
		var previousLanguageCodeStore, previousLanguageAutonymStore, module,
			previousLanguage, currentLanguage, previousAutonym, currentAutonym;

		if ( !userCanChangeLanguage() ) {
			return;
		}

		previousLanguageCodeStore = new Store( 'uls-previous-language-code' );
		previousLanguageAutonymStore = new Store( 'uls-previous-language-autonym' );

		previousLanguage = previousLanguageCodeStore.get();
		currentLanguage = mw.config.get( 'wgUserLanguage' );
		previousAutonym = previousLanguageAutonymStore.get();
		currentAutonym = mw.config.get( 'wgULSCurrentAutonym' );

		// If storage is empty, i.e. first visit, then store the current language
		// immediately so that we know when it changes.
		if ( !previousLanguage || !previousAutonym ) {
			previousLanguageCodeStore.set( currentLanguage );
			previousLanguageAutonymStore.set( currentAutonym );
			return;
		}

		if ( previousLanguage !== currentLanguage ) {
			// Use oojs-ui-core only after MediaWiki 1.26 is no longer supported
			module = mw.loader.getState( 'oojs-ui-core' ) === null ? 'oojs-ui' : 'oojs-ui-core';
			mw.loader.using( module ).done( function () {
				showUndoTooltip( previousLanguage, previousAutonym );
			} );
			previousLanguageCodeStore.set( currentLanguage );
			previousLanguageAutonymStore.set( currentAutonym );
			// Store this language in a list of frequently used languages
			mw.uls.addPreviousLanguage( currentLanguage );
		}
	}

	function initIme() {
		var imeSelector = mw.config.get( 'wgULSImeSelectors' ).join( ', ' );

		$( 'body' ).on( 'focus.imeinit', imeSelector, function () {
			var $input = $( this );
			$( 'body' ).off( '.imeinit' );
			mw.loader.using( 'ext.uls.ime', function () {
				mw.ime.setup();
				mw.ime.handleFocus( $input );
			} );
		} );
	}

	function init() {
		initInterface();
		initTooltip();
		initIme();
	}

	// Early execute of init
	if ( document.readyState === 'interactive' ) {
		init();
	} else {
		$( document ).ready( init );
	}
}( jQuery, mediaWiki ) );
