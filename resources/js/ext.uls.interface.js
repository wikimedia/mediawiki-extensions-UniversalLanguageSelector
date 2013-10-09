/**
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

	/**
	 * Construct the display settings link
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
	 * @returns {jQuery}
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
	 * @param {Object} uls The ULS object
	 */
	function addDisplaySettings( uls ) {
		var $displaySettings = displaySettings();

		uls.$menu.find( '#settings-block' ).append( $displaySettings );
		$displaySettings.on( 'click', function () {
			var languagesettings = $displaySettings.data( 'languagesettings' ),
				displaySettingsOptions = {
					defaultModule: 'display'
				},
				ulsPosition = mw.config.get( 'wgULSPosition' ),
				anonMode = ( mw.user.isAnon() &&
					!mw.config.get( 'wgULSAnonCanChangeLanguage' ) );

			if ( !languagesettings ) {
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
				mw.loader.using( mw.uls.languageSettingsModules, function () {
					$displaySettings.languagesettings( displaySettingsOptions )
						.click();
				} );
			}
			mw.hook( 'mw.uls.settings.open' ).fire( 'uls' );
			uls.hide();
		} );
	}

	/**
	 * Add input settings link to the settings bar in ULS
	 * @param {Object} uls The ULS object
	 */
	function addInputSettings( uls ) {
		var $inputSettings = inputSettings();

		uls.$menu.find( '#settings-block' ).append( $inputSettings );
		$inputSettings.on( 'click', function () {
			var position = uls.position(),
				languagesettings = $inputSettings.data( 'languagesettings' );

			if ( !languagesettings ) {
				mw.loader.using( mw.uls.languageSettingsModules, function () {
					$inputSettings.languagesettings( {
						defaultModule: 'input',
						onClose: function () {
							uls.show();
						},
						top: position.top,
						left: position.left
					} ).click();
				} );
			}

			mw.hook( 'mw.uls.settings.open' ).fire( 'uls' );
			uls.hide();
		} );
	}

	/**
	 * Helper function to make the uls triggers accessible with the keyboard.
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

	/**
	 * The tooltip to be shown when language changed using ULS
	 * It also allows to undo the language selection.
	 */
	function showULSTooltip() {
		var ulsPosition = mw.config.get( 'wgULSPosition' ),
			currentLang = mw.config.get( 'wgUserLanguage' ),
			previousLang,
			$ulsTrigger,
			anonMode,
			rtlPage = $( 'body' ).hasClass( 'rtl' ),
			tipsyGravity = {
				personal: 'n',
				interlanguage: rtlPage ? 'e' : 'w'
			},
			previousLanguages = mw.uls.getPreviousLanguages() || [];

		previousLang = previousLanguages.slice( -1 )[0];

		$ulsTrigger = ( ulsPosition === 'interlanguage' ) ?
			$( '.uls-settings-trigger' ) :
			$( '.uls-trigger' );

		if ( previousLang === currentLang ) {
			$ulsTrigger.tipsy( { gravity: rtlPage ? 'e' : 'w' } );

			return;
		}

		previousLanguages.push( currentLang );
		mw.uls.setPreviousLanguages( previousLanguages );

		anonMode = ( mw.user.isAnon() && !mw.config.get( 'wgULSAnonCanChangeLanguage' ) );

		if ( anonMode || !previousLang || !$.uls.data.languages[previousLang] ) {
			// Do not show tooltip
			return;
		}

		// Attach a tipsy tooltip to the trigger
		$ulsTrigger.tipsy( {
			gravity: tipsyGravity[ulsPosition],
			delayOut: 3000,
			html: true,
			fade: true,
			trigger: 'manual',
			title: function () {
				var link;

				link = $( '<a>' ).text( $.uls.data.getAutonym( previousLang ) )
					.attr( {
						href: '#',
						'class': 'uls-prevlang-link',
						lang: previousLang,
						dir: $.uls.data.getDir( previousLang )
					} );

				// Get the html of the link by wrapping it in div first
				link = $( '<div>' ).html( link ).html();

				return $.i18n( 'ext-uls-undo-language-tooltip-text', link );
			}
		} );

		function showTipsy( timeout ) {
			var tipsyTimer = 0;

			$ulsTrigger.tipsy( 'show' );
			// if the mouse is over the tooltip, do not hide
			$( '.tipsy' ).on( 'mouseover', function () {
				window.clearTimeout( tipsyTimer );
			} );
			$( '.tipsy' ).on( 'mouseout', function () {
				tipsyTimer = window.setTimeout( function () {
					hideTipsy();
				}, timeout );
			} );

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
			tipsyTimer = window.setTimeout( function () {
				hideTipsy();
			}, timeout );
		}

		function hideTipsy() {
			$ulsTrigger.tipsy( 'hide' );
		}

		// The interlanguage position needs some time to settle down
		window.setTimeout( function () {
			// Show the tipsy tooltip on page load.
			showTipsy( 6000 );
		}, 500 );

		// manually show the tooltip
		$ulsTrigger.on( 'mouseover', function () {
			// show only if the ULS panel is not shown
			if ( !$( '.uls-menu:visible' ).length ) {
				showTipsy( 3000 );
			}
		} );

		// hide the tooltip when clicked on uls trigger
		$ulsTrigger.on( 'click', function () {
			hideTipsy();
		} );
	}

	$( document ).ready( function () {
		mw.uls.init( function () {
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
				$ulsTrigger = $( '<span>' )
					.addClass( 'uls-settings-trigger' )
					.attr( 'title', $.i18n( 'ext-uls-language-settings-title' ) );
				// Append ULS cog to languages section, but make sure it is visible.
				$pLang.show().prepend( $ulsTrigger );
				// Take care of any other elements with this class.
				$ulsTrigger = $( '.uls-settings-trigger' );
				// Remove the dummy link, which was added to make sure that the section appears
				$pLang.find( '.uls-p-lang-dummy' ).remove();

				if ( !$pLang.find( 'div ul' ).children().length ) {
					// Replace the title of the interlanguage links area
					// if there are no interlanguage links
					$pLang.find( 'h3' )
						.text( mw.msg( 'uls-plang-title-languages' ) );

					// Remove the empty box that appears in the monobook skin
					if ( mw.config.get( 'skin' ) === 'monobook' ) {
						$pLang.find( 'div.pBody' ).remove();
					}
				}

				$ulsTrigger.attr( {
					title: $.i18n( 'ext-uls-select-language-settings-icon-tooltip' )
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
								var topRowHeight, caretHeight, caretWidth,
									$caretBefore = $( '<span>' ).addClass( 'caret-before' ),
									$caretAfter = $( '<span>' ).addClass( 'caret-after' ),
									ulsTriggerWidth = this.$element.width(),
									ulsTriggerOffset = this.$element.offset();

								// Add the callout caret triangle
								// pointing to the trigger icon
								this.$window.addClass( 'callout' );
								this.$window.prepend( $caretBefore, $caretAfter );

								// Calculate the positioning of the panel
								// according to the position of the trigger icon
								if ( rtlPage ) {
									caretWidth = parseInt( $caretBefore.css( 'border-left-width' ), 10 );
									this.left = ulsTriggerOffset.left - this.$window.width() - caretWidth;
								} else {
									caretWidth = parseInt( $caretBefore.css( 'border-right-width' ), 10 );
									this.left = ulsTriggerOffset.left + ulsTriggerWidth + caretWidth;
								}

								topRowHeight = this.$window.find( '.row' ).height();
								caretHeight = parseInt( $caretBefore.css( 'top' ), 10 );
								this.top = ulsTriggerOffset.top - topRowHeight - caretHeight / 2;

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

					if ( languagesettings ) {
						if ( !languagesettings.shown ) {
							mw.hook( 'mw.uls.settings.open' ).fire( eventParams && eventParams.source || 'personal' );
						}
					} else {
						mw.loader.using( mw.uls.languageSettingsModules, function () {
							$ulsTrigger.languagesettings();

							$ulsTrigger.trigger( 'click', eventParams );
						} );

						e.stopPropagation();
					}
				} );
			} else {
				$ulsTrigger.on( 'click', function ( e, eventParams ) {
					var uls = $ulsTrigger.data( 'uls' );

					if ( uls ) {
						if ( !uls.shown ) {
							mw.hook( 'mw.uls.settings.open' ).fire( eventParams && eventParams.source || 'personal' );
						}
					} else {
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
							onVisible: function () {
								mw.uls.addEventLoggingTriggers();
							}
						} ).trigger( 'click', eventParams );

						e.stopPropagation();
					}
				} );
			}
			// At this point we don't care which kind of trigger it is
			$triggers = $( '.uls-settings-trigger, .uls-trigger' );
			addAccessibilityFeatures( $triggers );

			// Bind language settings to preferences page link
			$( '#uls-preferences-link' )
				.text( $.i18n( 'ext-uls-language-settings-preferences-link' ) )
				.click( function () {
					$ulsTrigger.trigger( 'click', {
						source: 'preferences'
					} );

					return false;
				} );

			showULSTooltip();
		} );
	} );
}( jQuery, mediaWiki ) );
