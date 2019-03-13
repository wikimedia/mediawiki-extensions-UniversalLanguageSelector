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

( function () {
	'use strict';

	/**
	 * Construct the display settings link
	 *
	 * @return {jQuery}
	 */
	function displaySettings() {
		return $( '<button>' )
			.addClass( 'display-settings-block' )
			.attr( {
				title: $.i18n( 'ext-uls-display-settings-desc' ),
				'data-i18n': 'ext-uls-display-settings-title'
			} )
			.i18n();
	}

	/**
	 * Construct the input settings link
	 *
	 * @return {jQuery}
	 */
	function inputSettings() {
		return $( '<button>' )
			.addClass( 'input-settings-block' )
			.attr( {
				title: $.i18n( 'ext-uls-input-settings-desc' ),
				'data-i18n': 'ext-uls-input-settings-title'
			} )
			.i18n();
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
			$displaySettings.languagesettings( displaySettingsOptions ).trigger( 'click' );
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
			} ).trigger( 'click' );

		} );
	}

	function userCanChangeLanguage() {
		return mw.config.get( 'wgULSAnonCanChangeLanguage' ) || !mw.user.isAnon();
	}

	/**
	 * The tooltip to be shown when language changed using ULS.
	 * It also allows to undo the language selection.
	 *
	 * @param {string} previousLang
	 * @param {string} previousAutonym
	 */
	function showUndoTooltip( previousLang, previousAutonym ) {
		var $ulsTrigger, ulsPopup, ulsPopupPosition,
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
			$( '.uls-tipsy' ).on( 'mouseover', function () {
				window.clearTimeout( tipsyTimer );
			} ).on( 'mouseout', function () {
				tipsyTimer = window.setTimeout( hideTipsy, timeout );
			} );

			// hide the tooltip when clicked on it
			$( '.uls-tipsy' ).on( 'click', hideTipsy );

			tipsyTimer = window.setTimeout( hideTipsy, timeout );
		}

		// remove any existing popups
		if ( ulsPopup ) {
			ulsPopup.$element.remove();
		}
		if ( ulsPosition === 'interlanguage' ) {
			if ( $ulsTrigger.offset().left > $( window ).width() / 2 ) {
				ulsPopupPosition = 'before';
			} else {
				ulsPopupPosition = 'after';
			}
			// Reverse for RTL
			if ( $( 'html' ).prop( 'dir' ) === 'rtl' ) {
				ulsPopupPosition = ( ulsPopupPosition === 'after' ) ? 'before' : 'after';
			}
		} else {
			ulsPopupPosition = 'below';
		}
		ulsPopup = new OO.ui.PopupWidget( {
			padded: true,
			width: 300,
			classes: [ 'uls-tipsy' ],
			// Automatically positioned relative to the trigger
			$floatableContainer: $ulsTrigger,
			position: ulsPopupPosition,
			$content: ( function () {
				var messageKey, $link;

				$link = $( '<a>' )
					.text( previousAutonym )
					.prop( {
						href: '',
						class: 'uls-prevlang-link',
						lang: previousLang,
						// We could get dir from uls.data,
						// but we are trying to avoid loading it
						// and 'auto' is safe enough in this context.
						// T130390: must use attr
						dir: 'auto'
					} )
					.on( 'click', function ( event ) {
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

				if ( mw.storage.get( 'uls-gp' ) === '1' ) {
					messageKey = 'ext-uls-undo-language-tooltip-text-local';
				} else {
					messageKey = 'ext-uls-undo-language-tooltip-text';
				}

				return $( '<p>' ).append( mw.message( messageKey, $link ).parseDom() );
			}() )
		} );

		ulsPopup.$element.appendTo( 'body' );

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
		var $pLang,
			clickHandler,
			$ulsTrigger = $( '.uls-trigger' ),
			anonMode = ( mw.user.isAnon() &&
				!mw.config.get( 'wgULSAnonCanChangeLanguage' ) ),
			ulsPosition = mw.config.get( 'wgULSPosition' );

		if ( ulsPosition === 'interlanguage' ) {
			// TODO: Refactor this block
			// The interlanguage links section
			$pLang = $( '#p-lang' );
			// Add an element near the interlanguage links header
			$ulsTrigger = $( '<button>' )
				.addClass( 'uls-settings-trigger' );
			// Append ULS cog to languages section.
			$pLang.prepend( $ulsTrigger );
			// Take care of any other elements with this class.
			$ulsTrigger = $( '.uls-settings-trigger' );

			if ( !$pLang.find( 'div ul' ).children().length ) {
				// Replace the title of the interlanguage links area
				// if there are no interlanguage links
				$pLang.find( 'h3' )
					.text( mw.msg( 'uls-plang-title-languages' ) );
			}

			$ulsTrigger.attr( {
				title: mw.msg( 'ext-uls-select-language-settings-icon-tooltip' )
			} );

			clickHandler = function ( e, eventParams ) {
				var languagesettings = $ulsTrigger.data( 'languagesettings' ),
					languageSettingsOptions;

				if ( languagesettings ) {
					if ( !languagesettings.shown ) {
						mw.hook( 'mw.uls.settings.open' ).fire( eventParams && eventParams.source || 'interlanguage' );
					}

					return;
				}

				// Initialize the Language settings window
				languageSettingsOptions = {
					defaultModule: 'display',
					onVisible: function () {
						var caretRadius,
							ulsTriggerHeight = this.$element.height(),
							ulsTriggerWidth = this.$element[ 0 ].offsetWidth,
							ulsTriggerOffset = this.$element.offset();

						this.$window.addClass( 'callout' );

						// Same as border width in mixins.less, or near enough
						caretRadius = 12;

						if ( ulsTriggerOffset.left > $( window ).width() / 2 ) {
							this.left = ulsTriggerOffset.left - this.$window.width() - caretRadius;
							this.$window.removeClass( 'selector-left' ).addClass( 'selector-right' );

						} else {
							this.left = ulsTriggerOffset.left + ulsTriggerWidth + caretRadius;
							this.$window.removeClass( 'selector-right' ).addClass( 'selector-left' );
						}

						// The top of the dialog is aligned in relation to
						// the middle of the trigger, so that middle of the
						// caret aligns with it. 16 is trigger icon height in pixels
						this.top = ulsTriggerOffset.top +
							( ulsTriggerHeight / 2 ) -
							( caretRadius + 16 );

						this.position();
					}
				};

				mw.loader.using( mw.uls.languageSettingsModules, function () {
					$ulsTrigger.languagesettings( languageSettingsOptions ).trigger( 'click' );
				} );

				e.stopPropagation();
			};
		} else if ( anonMode ) {
			clickHandler = function ( e, eventParams ) {
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
			};
		} else {
			clickHandler = function ( e, eventParams ) {
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
							},
							// Not actually used on sites with the gear icon
							// in the interlanguage area, because this ULS
							// will be a container for other ULS panels.
							// However, this is used on sites with ULS
							// in the personal bar, and in that case it has the same
							// purpose as the selector in Display settings,
							// so it has the same identifier.
							ulsPurpose: 'interface-language'
						} );

						// Allow styles to apply first and position to work by
						// delaying the activation after them.
						window.setTimeout( function () {
							$ulsTrigger.trigger( 'click', eventParams );
						}, 0 );
					} );
				}
			};
		}

		$ulsTrigger.on( 'click', clickHandler );

		// Bind language settings to preferences page link
		$( '#uls-preferences-link' )
			.on( 'click keypress', function ( e ) {
				if (
					e.type === 'click' ||
					e.type === 'keypress' && e.which === 13
				) {
					$ulsTrigger.trigger( 'click', {
						source: 'preferences'
					} );
				}

				return false;
			} );
	}

	function initTooltip() {
		var previousLanguage, currentLanguage, previousAutonym, currentAutonym;

		if ( !userCanChangeLanguage() ) {
			return;
		}

		previousLanguage = mw.storage.get( 'uls-previous-language-code' );
		currentLanguage = mw.config.get( 'wgUserLanguage' );
		previousAutonym = mw.storage.get( 'uls-previous-language-autonym' );
		currentAutonym = mw.config.get( 'wgULSCurrentAutonym' );

		// If storage is empty, i.e. first visit, then store the current language
		// immediately so that we know when it changes.
		if ( !previousLanguage || !previousAutonym ) {
			mw.storage.set( 'uls-previous-language-code', currentLanguage );
			mw.storage.set( 'uls-previous-language-autonym', currentAutonym );
			return;
		}

		if ( previousLanguage !== currentLanguage ) {
			mw.loader.using( 'oojs-ui-core' ).done( function () {
				showUndoTooltip( previousLanguage, previousAutonym );
			} );
			mw.storage.set( 'uls-previous-language-code', currentLanguage );
			mw.storage.set( 'uls-previous-language-autonym', currentAutonym );
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
		$( init );
	}

}() );
