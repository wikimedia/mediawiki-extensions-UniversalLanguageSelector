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
		launchULS = require( './ext.uls.launch.js' ),
		ActionsMenu = require( './ext.uls.actions.menu.js' ),
		ActionsMenuItem = require( './ext.uls.actions.menu.item.js' );
	require( './ext.uls.actions.menu.items.registry.js' );

	/**
	 * For Vector, check if the language button id exists.
	 * For other skins, check wgULSDisplaySettingsInInterlanguage for the current skin.
	 *
	 * @return {boolean}
	 */
	function isUsingStandaloneLanguageButton() {
		// Checking for the ULS language button id returns true for Vector, false for other skins.
		return $( '#p-lang-btn' ).length > 0 || mw.config.get( 'wgULSDisplaySettingsInInterlanguage' );
	}

	/**
	 * @param {jQuery} $element
	 * @param {Function} onCloseHandler
	 * @param {Object} uls
	 */
	function openLanguageSettings( $element, onCloseHandler, uls ) {
		mw.loader.using( languageSettingsModules ).then( function () {
			$element.languagesettings( {
				defaultModule: 'display',
				onClose: onCloseHandler,
				onPosition: uls.position.bind( uls ),
				onVisible: uls.hide.bind( uls )
			} ).trigger( 'click' );
		} );
	}

	/**
	 * Provide entry points to create article in other languages. T290436
	 *
	 * @param {Object} uls The ULS object
	 */
	function addEmptyState( uls ) {
		var $emptyStateContainer = $( '<section>' ).addClass( 'uls-empty-state' );

		function openActionsMenuEventHandler( event ) {
			event.stopPropagation();
			function onMenuClose() {
				uls.show();
			}
			openLanguageSettings( $( event.target ), onMenuClose, uls );
		}

		var languageSettingsMenuItem = {
			name: 'languageSettings',
			icon: 'settings',
			text: $.i18n( 'ext-uls-actions-menu-language-settings-item-label' ),
			handler: openActionsMenuEventHandler
		};

		var actionItemsRegistry = mw.uls.ActionsMenuItemsRegistry;
		actionItemsRegistry.register( languageSettingsMenuItem );

		var $header = $( '<h3>' )
			.addClass( 'uls-empty-state__header' )
			.text( $.i18n( 'ext-uls-empty-state-header' ) );
		var $desc = $( '<p>' )
			.addClass( 'uls-empty-state__desc' )
			.text( $.i18n( 'ext-uls-empty-state-desc' ) );
		$emptyStateContainer.append( $header, $desc );
		uls.$resultsView.append( $emptyStateContainer );

		if ( actionItemsRegistry.size() > 1 ) {
			// languageSettingsMenuItem will be always there.
			// If other actions available, change text
			$header.text( $.i18n( 'ext-uls-empty-state-header-actions-available' ) );
			$desc.text( $.i18n( 'ext-uls-empty-state-desc-actions-available' ) );
		}

		// Action menu items need OOUI widgets. Load them and register trigger event handler.
		mw.loader.using( [ 'oojs-ui-widgets', 'oojs-ui.styles.icons-interactions' ] ).done( function () {
			var $actionsList = $( '<ul>' ).addClass( 'uls-language-action-items' );
			actionItemsRegistry.getItems().forEach( function ( actionItem ) {
				var actionButton = new ActionsMenuItem(
					actionItem.icon,
					actionItem.text,
					actionItem.handler,
					actionItem.href
				).render();
				$actionsList.append( $( '<li>' ).append( actionButton.$element ) );
			} );

			$emptyStateContainer.append( $actionsList );
		} );
	}

	/**
	 * Helper method for creating jQuery buttons, used in "addActionsMenuTriggers" method below
	 *
	 * @param {string} buttonClass a class to be added to the created button class list
	 * @return {jQuery}
	 */
	function createMenuButton( buttonClass ) {
		var classes = [
			'cdx-button',
			'cdx-button--weight-quiet',
			buttonClass
		];
		// eslint-disable-next-line mediawiki/class-doc
		return $( '<button>' ).addClass( classes );
	}

	/**
	 * @param {Object} uls The ULS object
	 * @return {jQuery}
	 */
	function addLanguageSettingsTrigger( uls ) {
		var $ulsSettingsBlock = uls.$menu.find( '#uls-settings-block' ).eq( 0 );
		$ulsSettingsBlock.addClass( 'uls-settings-block--vector-2022' );

		var $languageSettingsMenuButton = createMenuButton( 'uls-language-settings-button' );
		$languageSettingsMenuButton.one( 'click', function () {
			openLanguageSettings( $languageSettingsMenuButton, uls.show.bind( uls ), uls );
		} );
		$ulsSettingsBlock.append( $languageSettingsMenuButton );

		uls.$menu.addClass( 'notheme skin-invert' ); // T365990
		return $ulsSettingsBlock;
	}

	/**
	 * Add the button that opens the "Add languages" menu (that contain options
	 * like "Translate this page" and "Edit language links") and the button that
	 * opens the "Language settings" menu.
	 *
	 * @param {Object} uls The ULS object
	 */
	function addActionsMenuTriggers( uls ) {
		var $ulsSettingsBlock = addLanguageSettingsTrigger( uls );

		var actionItemsRegistry = mw.uls.ActionsMenuItemsRegistry;
		actionItemsRegistry.on( 'register', onActionItemAdded );

		var addLanguagesMenuDialog;
		var $addLanguagesMenuButton;

		var prependAddLanguagesMenuButton = function () {
			$addLanguagesMenuButton = createMenuButton( 'uls-add-languages-button' ).attr( {
				'data-i18n': 'ext-uls-add-languages-button-label'
			} ).i18n();

			$ulsSettingsBlock.addClass( 'uls-settings-block--with-add-languages' );
			$ulsSettingsBlock.prepend( $addLanguagesMenuButton );

			// Action menu items need OOUI widgets. Load them and register trigger event handler.
			mw.loader.using( [ 'oojs-ui-widgets', 'oojs-ui.styles.icons-interactions' ] ).done( function () {
				$addLanguagesMenuButton.on( 'click', function () {
					addLanguagesMenuDialog = addLanguagesMenuDialog || new ActionsMenu( {
						actions: actionItemsRegistry.getItems(),
						onPosition: uls.position.bind( uls ),
						onClose: uls.show.bind( uls )
					} );
					addLanguagesMenuDialog.render();
					uls.hide();
				} );
			} );
		};

		if ( actionItemsRegistry.size() ) {
			prependAddLanguagesMenuButton();
		}
		function onActionItemAdded( itemName, item ) {
			if ( !$addLanguagesMenuButton ) {
				prependAddLanguagesMenuButton();
			} else if ( addLanguagesMenuDialog ) {
				addLanguagesMenuDialog.renderAction( item );
			}
		}
	}

	function userCanChangeLanguage() {
		return mw.config.get( 'wgULSAnonCanChangeLanguage' ) || mw.user.isNamed();
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

	function initSecondaryEntryPoints() {
		$( '.uls-settings-trigger' ).one( 'click', function ( e ) {
			e.preventDefault();
			mw.loader.using( languageSettingsModules, function () {
				$( e.target ).languagesettings();
				$( e.target ).trigger( 'click' );
			} );
		} );
	}

	function initInterlanguageEntryPoint() {
		var $pLang = $( '#p-lang' );

		var $trigger = $( '<button>' )
			.addClass( 'uls-settings-trigger' )
			.prop( 'title', mw.msg( 'ext-uls-select-language-settings-icon-tooltip' ) );

		// Append ULS cog to interlanguage section header in the sidebar
		$pLang.prepend( $trigger );

		// Replace the title of the interlanguage links area from "In other languages" to
		// "Languages" if there are no language links. TODO: Remove this feature?
		if ( !$pLang.find( 'div ul' ).children().length && isUsingStandaloneLanguageButton ) {
			$pLang.find( 'h3' ).text( mw.msg( 'uls-plang-title-languages' ) );
		}

		var clickHandler = function ( e ) {
			var languagesettings = $trigger.data( 'languagesettings' ),
				languageSettingsOptions;

			if ( languagesettings ) {
				if ( !languagesettings.shown ) {
					mw.hook( 'mw.uls.settings.open' ).fire( 'interlanguage' );
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

		$trigger.on( 'click', clickHandler );
	}

	function initPersonalEntryPoint() {
		var $trigger = $( '.uls-trigger' );
		var clickHandler;

		if ( !userCanChangeLanguage() ) {
			clickHandler = function ( e ) {
				var languagesettings = $trigger.data( 'languagesettings' );

				e.preventDefault();

				if ( languagesettings ) {
					if ( !languagesettings.shown ) {
						mw.hook( 'mw.uls.settings.open' ).fire( 'personal' );
					}
				} else {
					mw.loader.using( languageSettingsModules, function () {
						$trigger.languagesettings( { autoOpen: true } );
						mw.hook( 'mw.uls.settings.open' ).fire( 'personal' );
					} );
					// Stop propagating the event to avoid closing the languagesettings dialog
					// when the event propagates to the document click handler inside
					// languagesettings
					e.stopPropagation();
				}
			};
		} else {
			clickHandler = function ( e, eventParams ) {
				var uls = $trigger.data( 'uls' );

				e.preventDefault();

				if ( uls ) {
					if ( !uls.shown ) {
						mw.hook( 'mw.uls.settings.open' ).fire( 'personal' );
					}
				} else {
					mw.loader.using( 'ext.uls.mediawiki', function () {
						$trigger.uls( {
							quickList: function () {
								return mw.uls.getFrequentLanguageList();
							},
							// partially copied from ext.uls.lauch
							onPosition: function () {
								// Default positioning of jquery.uls is middle of the screen under
								// the trigger. This code aligns it under the trigger and to the
								// trigger edge depending on which side of the page the trigger is
								// It should work automatically both LTR and RTL.
								var offset, height, width, positionCSS;
								offset = $trigger.offset();
								width = $trigger.outerWidth();
								height = $trigger.outerHeight();

								if ( offset.left + ( width / 2 ) > $( window ).width() / 2 ) {
									// Midpoint of the trigger is on the right side of the viewport.
									positionCSS = {
										// Right dialog edge aligns with right edge of the trigger.
										right: $( window ).width() - ( offset.left + width ),
										top: offset.top + height
									};
								} else {
									// Midpoint of the trigger is on the left side of the viewport.
									positionCSS = {
										// Left dialog edge aligns with left edge of the trigger.
										left: offset.left,
										top: offset.top + height
									};
								}

								return positionCSS;
							},
							onReady: function () {
								addLanguageSettingsTrigger( this );
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
		// Optimization: Prefetch the Resource loader modules for ULS on mouseover
		$trigger.one( 'mouseover', function () {
			mw.loader.load( languageSettingsModules );
		} );
	}

	function initLanguageChangeUndoTooltip() {
		var previousLanguage, currentLanguage, previousAutonym, currentAutonym;

		if ( !userCanChangeLanguage() ) {
			return;
		}

		previousLanguage = mw.storage.get( 'uls-previous-language-code' );
		currentLanguage = mw.config.get( 'wgUserLanguage' );
		previousAutonym = mw.storage.get( 'uls-previous-language-autonym' );
		currentAutonym = require( '../data.json' ).currentAutonym;

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
	 * Special handling for checkbox hack.
	 * Disable default checkbox behavior and bind click to "Enter" keyboard events
	 */
	function handleCheckboxSelector() {
		// If the ULS button is also a checkbox, we can
		// conclude that it's using the checkbox hack.
		$( document ).on( 'input', 'input.mw-interlanguage-selector[type="checkbox"]', function ( ev ) {
			var elem = ev.currentTarget;
			elem.checked = false;
		} );

		$( document ).on( 'keydown', 'input.mw-interlanguage-selector[type="checkbox"]', function ( ev ) {
			var elem = ev.currentTarget;
			if ( ev.key !== 'Enter' ) {
				return;
			}
			elem.click();
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

		// Avoid reinitializing ULS multiple times for an element
		if ( $target.attr( 'data-uls-loaded' ) ) {
			return;
		}
		$target.attr( 'data-uls-loaded', true );

		ev.preventDefault();

		mw.loader.using( [ 'ext.uls.mediawiki', '@wikimedia/codex' ] ).then( function () {
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
				if ( languageNodes.length ) {
					addActionsMenuTriggers( uls );
				} else {
					// first hide #uls-settings-block div since it's unused, and it causes
					// an unwanted extra border to show up at the bottom of the menu
					uls.$menu.find( '#uls-settings-block' ).eq( 0 ).hide();
					// There are no languages - The article exist only the current language wiki
					// Provide entry points to create article in other languages. T290436
					addEmptyState( uls );
				}
				$target.trigger( 'click' );
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
			$( document ).on( 'click', '.mw-interlanguage-selector', loadContentLanguageSelector );
			// Special handling for checkbox hack.
			handleCheckboxSelector();
		}
	}

	/**
	 * The new Vector 2022 skin uses a less prominent language button for non-content pages.
	 * For these pages, the ULS should not be displayed, but a dropdown with an appropriate message
	 * should appear. The UniversalLanguageSelector extension should add a button to open the
	 * language settings, inside this dropdown.
	 * This method adds this button inside the dropdown.
	 */
	function addLanguageSettingsToNonContentPages() {
		var $languageBtn = $( '#p-lang-btn' );
		var clickHandler = function ( event ) {
			event.stopPropagation();
			mw.loader.using( languageSettingsModules ).then( function () {
				$( event.target ).languagesettings( {
					autoOpen: true,
					onPosition: function () {
						var offset = $languageBtn.offset();
						var top = offset.top + $languageBtn.outerHeight();
						var right = $( window ).width() - offset.left - $languageBtn.outerWidth();
						return { top: top, right: right };
					}
				} );
			} );
		};
		// the first time the language button is clicked inside a non-content page,
		// we should add the "Open language settings" button inside the dropdown
		$languageBtn.one( 'mouseover', function () {
			mw.loader.using( [ 'oojs-ui-widgets', 'oojs-ui.styles.icons-interactions', 'ext.uls.messages' ] )
				.done( function () {
					var actionButton = new ActionsMenuItem(
						'settings',
						$.i18n( 'ext-uls-actions-menu-language-settings-item-label' ),
						clickHandler,
						null
					).render();
					actionButton.$element.addClass( 'empty-language-selector__language-settings-button' );
					var $emptyLanguageSelectorBody = $( '.mw-portlet-empty-language-selector-body' );
					$emptyLanguageSelectorBody.after( actionButton.$element );
				} );
		} );
	}
	function init() {
		// if it's not Vector skin, nothing to be done here
		if ( mw.config.get( 'skin' ) === 'vector-2022' && mw.config.get( 'wgULSisLanguageSelectorEmpty' ) ) {
			// if this is a non-content page, we should add the "Open language settings" button
			// inside the language dropdown
			addLanguageSettingsToNonContentPages();
		}

		initLanguageChangeUndoTooltip();
		initIme();

		// There are three basic components of ULS interface:
		// - language selection for interface
		// - language selection for content
		// - settings view (access to language selection for interface, fonts, input methods)
		//
		// These can be combined in different ways:
		// - Vector skin (recently) has an omni selector that has content language selection as
		//   primary action with access to the settings view. It is on top right corner (LTR) of
		//   the page content area. It may not be present on all pages.
		// - Compact language links provides access to content language selection only and it is in
		//   the interlanguage section of the sidebar. This is in addition to one of the main entry
		//   points below.
		// - Personal entry point appears at the top of the page. It provides quick access to the
		//   interface language selection with access to the settings view, except if user is not
		//   logged in and not allowed to change a language. In this case it defaults to settings
		//   view without language selection.
		// - Interlanguage entry point (a cog) appears in the interlanguage section in the sidebar.
		//   It defaults to the settings view.
		//
		// The three main entry points (omni selector, personal, interlanguage) are mutually
		// exclusive. There may be secondary entry points anywhere on the page using the
		// uls-settings-trigger class.

		// First init secondary to avoid initing the interlanguage entry point multiple times
		initSecondaryEntryPoints();
		var position = mw.config.get( 'wgULSPosition' );
		if ( position === 'interlanguage' ) {
			initInterlanguageEntryPoint();
		} else {
			initPersonalEntryPoint();
		}

		// whether to load compact language links
		var compact = mw.config.get( 'wgULSisCompactLinksEnabled' );
		// whether to show the omni box or not
		var languageInHeader = mw.config.get( 'wgVector2022LanguageInHeader' );

		if ( compact || languageInHeader ) {
			// Init compact languages OR omni selector using the mw-interlanguage-selector class
			initContentLanguageSelectorClickHandler();
		} else {
			$( '.mw-interlanguage-selector' ).removeClass( 'mw-interlanguage-selector' );
			document.body.classList.add( 'mw-interlanguage-selector-disabled' );
		}
	}

	// Early execute of init
	if ( document.readyState === 'interactive' ) {
		init();
	} else {
		$( init );
	}

}() );
