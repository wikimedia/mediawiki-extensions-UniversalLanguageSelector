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
	var languageSettingsModules = [ 'ext.uls.displaysettings' ],
		launchULS = require( './ext.uls.launch.js' );

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
	 * For Vector: Check whether the classic Vector or "new" vector ([[mw:Desktop_improvements]]) is enabled based
	 * on the contents of the page.
	 * For other skins, check if ULSDisplayInputAndDisplaySettingsInInterlanguage contains the current skin.
	 *
	 * @return {boolean}
	 */
	function isUsingStandaloneLanguageButton() {
		var skin = mw.config.get( 'skin' );
		// special handling for Vector.
		return skin === 'vector' ? $( '#p-lang-btn' ).length > 0 :
			mw.config.get( 'wgULSDisplaySettingsInInterlanguage' );
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
			$displaySettings.languagesettings( {
				defaultModule: 'display',
				onClose: uls.show.bind( uls ),
				onPosition: uls.position.bind( uls ),
				onVisible: uls.hide.bind( uls )
			} ).trigger( 'click' );
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
			$inputSettings.languagesettings( {
				defaultModule: 'input',
				onClose: uls.show.bind( uls ),
				onPosition: uls.position.bind( uls ),
				onVisible: uls.hide.bind( uls )
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
		var trigger, popup, popupPosition,
			configPosition = mw.config.get( 'wgULSPosition' ),
			triggerSelector = ( configPosition === 'interlanguage' ) ?
				'.uls-settings-trigger, .mw-interlanguage-selector' :
				'.uls-trigger';

		// Fallback if no entry point is present
		trigger = document.querySelector( triggerSelector ) || document.querySelector( '#pt-preferences' );

		// Skip tooltip if there is no element to attach the tooltip to.
		// It will cause errors otherwise.
		if ( !trigger ) {
			return;
		}

		function hideTipsy() {
			popup.toggle( false );
		}

		function showTipsy( timeout ) {
			var tipsyTimer = 0;

			popup.toggle( true );
			popup.toggleClipping( false );

			// if the mouse is over the tooltip, do not hide
			$( '.uls-tipsy' ).on( 'mouseover', function () {
				clearTimeout( tipsyTimer );
			} ).on( 'mouseout', function () {
				tipsyTimer = setTimeout( hideTipsy, timeout );
			} ).on( 'click', hideTipsy );

			tipsyTimer = setTimeout( hideTipsy, timeout );
		}

		if ( configPosition === 'interlanguage' ) {
			popupPosition = 'after';
		} else {
			popupPosition = 'below';
		}
		popup = new OO.ui.PopupWidget( {
			padded: true,
			width: 300,
			classes: [ 'uls-tipsy' ],
			// Automatically positioned relative to the trigger
			$floatableContainer: $( trigger ),
			position: popupPosition,
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
						event.preventDefault();

						// Track if event logging is enabled
						mw.hook( 'mw.uls.language.revert' ).fire();

						mw.loader.using( [ 'ext.uls.common' ] ).then( function () {
							mw.uls.changeLanguage( event.target.lang );
						} );
					} );

				if ( mw.storage.get( 'uls-gp' ) === '1' ) {
					messageKey = 'ext-uls-undo-language-tooltip-text-local';
				} else {
					messageKey = 'ext-uls-undo-language-tooltip-text';
				}

				// Message keys listed above
				// eslint-disable-next-line mediawiki/msg-doc
				return $( '<p>' ).append( mw.message( messageKey, $link ).parseDom() );
			}() )
		} );

		popup.$element.appendTo( document.body );

		// The interlanguage position needs some time to settle down
		setTimeout( function () {
			// Show the tipsy tooltip on page load.
			showTipsy( 6000 );
		}, 700 );

		// manually show the tooltip
		$( trigger ).on( 'mouseover', function () {
			// show only if the ULS panel is not shown
			// eslint-disable-next-line no-jquery/no-sizzle
			if ( !$( '.uls-menu:visible' ).length ) {
				showTipsy( 3000 );
			}
		} );
	}

	/**
	 * Adds display and input settings to the ULS dialog after loading their code.
	 *
	 * @param {ULS} uls instance
	 * @return {jQuery.Promise}
	 */
	function loadDisplayAndInputSettings( uls ) {
		return mw.loader.using( languageSettingsModules ).then( function () {
			addDisplaySettings( uls );
			addInputSettings( uls );
		} );
	}

	function initInterface() {
		var $pLang,
			clickHandler,
			// T273928: No change to the heading should be made in modern Vector when the language
			// button is present
			isButton = isUsingStandaloneLanguageButton(),
			$trigger = $( '.uls-trigger' ),
			anonMode = ( mw.user.isAnon() &&
				!mw.config.get( 'wgULSAnonCanChangeLanguage' ) ),
			configPosition = mw.config.get( 'wgULSPosition' );

		if ( !mw.config.get( 'wgULSisCompactLinksEnabled' ) ) {
			// The wgULSisCompactLinksEnabled flag when disabled will not render a language button to the page
			// Skins can control where the button is placed, by adding an element with mw-interlanguage-selector to the page,
			// the display of which is not impacted by this flag. To signal to these skins that the language button should be
			// disabled, the class is removed.
			$( '.mw-interlanguage-selector' ).removeClass( 'mw-interlanguage-selector' );
			return;
		}

		if ( configPosition === 'interlanguage' ) {
			// TODO: Refactor this block
			// The interlanguage links section.
			$pLang = $( '#p-lang' );
			// Add an element near the interlanguage links header
			$trigger = $( '<button>' )
				.addClass( 'uls-settings-trigger' );
			// Append ULS cog to languages section.
			$pLang.prepend( $trigger );
			// Take care of any other elements with this class.
			$trigger = $( '.uls-settings-trigger' );

			if ( !$pLang.find( 'div ul' ).children().length && isButton ) {
				// Replace the title of the interlanguage links area
				// if there are no interlanguage links
				$pLang.find( 'h3' )
					.text( mw.msg( 'uls-plang-title-languages' ) );
			}

			$trigger.attr( {
				title: mw.msg( 'ext-uls-select-language-settings-icon-tooltip' )
			} );

			clickHandler = function ( e, eventParams ) {
				var languagesettings = $trigger.data( 'languagesettings' ),
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
					onPosition: function () {
						var caretRadius, top, left,
							ulsTriggerHeight = this.$element.height(),
							ulsTriggerWidth = this.$element[ 0 ].offsetWidth,
							ulsTriggerOffset = this.$element.offset();

						// Same as border width in mixins.less, or near enough
						caretRadius = 12;

						if ( ulsTriggerOffset.left > $( window ).width() / 2 ) {
							left = ulsTriggerOffset.left - this.$window.width() - caretRadius;
							this.$window.removeClass( 'selector-left' ).addClass( 'selector-right' );
						} else {
							left = ulsTriggerOffset.left + ulsTriggerWidth + caretRadius;
							this.$window.removeClass( 'selector-right' ).addClass( 'selector-left' );
						}

						// The top of the dialog is aligned in relation to
						// the middle of the trigger, so that middle of the
						// caret aligns with it. 16 is trigger icon height in pixels
						top = ulsTriggerOffset.top +
							( ulsTriggerHeight / 2 ) -
							( caretRadius + 16 );

						return { top: top, left: left };
					},
					onVisible: function () {
						this.$window.addClass( 'callout' );
					}
				};

				mw.loader.using( languageSettingsModules, function () {
					$trigger.languagesettings( languageSettingsOptions ).trigger( 'click' );
				} );

				e.stopPropagation();
			};
		} else if ( anonMode ) {
			clickHandler = function ( e, eventParams ) {
				var languagesettings = $trigger.data( 'languagesettings' );

				e.preventDefault();

				if ( languagesettings ) {
					if ( !languagesettings.shown ) {
						mw.hook( 'mw.uls.settings.open' ).fire( eventParams && eventParams.source || 'personal' );
					}
				} else {
					mw.loader.using( languageSettingsModules, function () {
						$trigger.languagesettings();

						$trigger.trigger( 'click', eventParams );
					} );
				}
			};
		} else {
			clickHandler = function ( e, eventParams ) {
				var uls = $trigger.data( 'uls' );

				e.preventDefault();

				if ( uls ) {
					if ( !uls.shown ) {
						mw.hook( 'mw.uls.settings.open' ).fire( eventParams && eventParams.source || 'personal' );
					}
				} else {
					mw.loader.using( 'ext.uls.mediawiki', function () {
						$trigger.uls( {
							quickList: function () {
								return mw.uls.getFrequentLanguageList();
							},
							onReady: function () {
								loadDisplayAndInputSettings( this );
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
						setTimeout( function () {
							$trigger.trigger( 'click', eventParams );
						}, 0 );
					} );
				}
			};
		}

		$trigger.on( 'click', clickHandler );

		// Bind language settings to preferences page link
		$( '#uls-preferences-link' )
			.on( 'click keypress', function ( e ) {
				if (
					e.type === 'click' ||
					e.type === 'keypress' && e.which === 13
				) {
					$trigger.trigger( 'click', {
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
			mw.loader.using( [ 'ext.uls.common' ] ).then( function () {
				mw.uls.addPreviousLanguage( currentLanguage );
			} );
		}
	}

	function initIme() {
		var imeSelector = mw.config.get( 'wgULSImeSelectors' ).join( ', ' );

		$( document.body ).on( 'focus.imeinit', imeSelector, function () {
			var $input = $( this );
			$( document.body ).off( '.imeinit' );
			mw.loader.using( 'ext.uls.ime', function () {
				mw.ime.setup();
				mw.ime.handleFocus( $input );
			} );
		} );
	}

	/**
	 * Load and open ULS for content language selection.
	 *
	 * This dialog is primarily for selecting the language of the content, but may also provide
	 * access to display and input settings if isUsingStandaloneLanguageButton() returns true.
	 *
	 * @param {jQuery.Event} ev
	 */
	function loadContentLanguageSelector( ev ) {
		var $target = $( ev.currentTarget );
		ev.preventDefault();

		mw.loader.using( 'ext.uls.mediawiki' ).then( function () {
			var parent, languageNodes, standalone, uls;

			parent = document.querySelectorAll( '.mw-portlet-lang, #p-lang' )[ 0 ];
			languageNodes = parent ? parent.querySelectorAll( '.interlanguage-link-target' ) : [];
			standalone = isUsingStandaloneLanguageButton();

			// Setup click handler for ULS
			launchULS(
				$target,
				mw.uls.getInterlanguageListFromNodes( languageNodes ),
				// Using this as heuristic for now. May need to reconsider later. Enables
				// behavior specific to compact language links.
				!standalone
			);

			// Trigger the click handler to open ULS once ready
			if ( standalone ) {
				// Provide access to display and input settings if this entry point is the single
				// point of access to all language settings.
				uls = $target.data( 'uls' );
				loadDisplayAndInputSettings( uls ).always( function () {
					$target.trigger( 'click' );
				} );
			} else {
				$target.trigger( 'click' );
			}
		} );
	}

	/** Setup lazy-loading for content language selector */
	function initContentLanguageSelectorClickHandler() {
		// FIXME: In Timeless ULS is embedded in a menu which stops event propagation
		if ( $( '.sidebar-inner' ).length ) {
			$( '.sidebar-inner #p-lang' )
				.one( 'click', '.mw-interlanguage-selector', loadContentLanguageSelector );
		} else {
			// This button may be created by the new Vector skin, or ext.uls.compactlinks module
			// if there are many languages. Warning: Both this module and ext.uls.compactlinks
			// module may run simultaneously. Using event delegation to avoid race conditions where
			// the trigger may be created after this code.
			$( document ).one( 'click', '.mw-interlanguage-selector', loadContentLanguageSelector );
		}
	}

	function init() {
		initInterface();
		initTooltip();
		initIme();
		initContentLanguageSelectorClickHandler();
	}

	// Early execute of init
	if ( document.readyState === 'interactive' ) {
		init();
	} else {
		$( init );
	}

}() );
