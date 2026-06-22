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
	const languageSettingsModules = [ 'ext.uls.displaysettings' ],
		launchULS = require( './ext.uls.launch.js' ),
		ActionsMenu = require( './ext.uls.actions.menu.js' ),
		ActionsMenuItem = require( './ext.uls.actions.menu.item.js' );
	require( './ext.uls.actions.menu.items.registry.js' );

	// Whether the ULS V2 (rewrite) selector is enabled for this page.
	const isULSV2Enabled = mw.config.get( 'wgULSLanguageSelectorV2Enabled' );

	/**
	 * Warm the lazy-loaded ULS rewrite (V2) modules so the selector opens
	 * without a network round-trip on click. No-ops when V2 is disabled.
	 *
	 * @return {string[]} The list of modules.
	 */
	function prefetchRewriteModules() {
		const isMinerva = mw.config.get( 'skin' ) === 'minerva';
		const modules = isMinerva ?
			[ 'ext.uls.mediawiki', 'ext.uls.rewrite' ] :
			[ 'ext.uls.mediawiki', 'ext.uls.rewrite.languagesettings', 'ext.uls.rewrite' ];

		if ( isULSV2Enabled ) {
			mw.loader.load( modules );
		}

		return modules;
	}

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
		mw.loader.using( languageSettingsModules ).then( () => {
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
		const $emptyStateContainer = $( '<section>' ).addClass( 'uls-empty-state' );

		function openActionsMenuEventHandler( event ) {
			event.stopPropagation();
			function onMenuClose() {
				uls.show();
			}
			openLanguageSettings( $( event.target ), onMenuClose, uls );
		}

		const languageSettingsMenuItem = {
			name: 'languageSettings',
			icon: 'settings',
			text: $.i18n( 'ext-uls-actions-menu-language-settings-item-label' ),
			handler: openActionsMenuEventHandler
		};

		const actionItemsRegistry = mw.uls.ActionsMenuItemsRegistry;
		actionItemsRegistry.register( languageSettingsMenuItem );

		const $header = $( '<h3>' )
			.addClass( 'uls-empty-state__header' )
			.text( $.i18n( 'ext-uls-empty-state-header' ) );
		const $desc = $( '<p>' )
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
		mw.loader.using( [ 'oojs-ui-widgets', 'oojs-ui.styles.icons-interactions' ] ).then( () => {
			const $actionsList = $( '<ul>' ).addClass( 'uls-language-action-items' );
			actionItemsRegistry.getItems().forEach( ( actionItem ) => {
				const actionButton = new ActionsMenuItem(
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
		const classes = [
			'cdx-button',
			'cdx-button--weight-quiet',
			buttonClass
		];

		return $( '<button>' ).addClass( classes );
	}

	/**
	 * @param {Object} uls The ULS object
	 * @return {jQuery}
	 */
	function addLanguageSettingsTrigger( uls ) {
		const $ulsSettingsBlock = uls.$menu.find( '#uls-settings-block' ).eq( 0 );
		$ulsSettingsBlock.addClass( 'uls-settings-block--vector-2022' );

		const $languageSettingsMenuButton = createMenuButton( 'uls-language-settings-button' );
		$languageSettingsMenuButton.one( 'click', () => {
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
		const $ulsSettingsBlock = addLanguageSettingsTrigger( uls );

		const actionItemsRegistry = mw.uls.ActionsMenuItemsRegistry;
		actionItemsRegistry.on( 'register', onActionItemAdded );

		let addLanguagesMenuDialog;
		let $addLanguagesMenuButton;

		const prependAddLanguagesMenuButton = function () {
			$addLanguagesMenuButton = createMenuButton( 'uls-add-languages-button' ).attr( {
				'data-i18n': 'ext-uls-add-languages-button-label'
			} ).i18n();

			$ulsSettingsBlock.addClass( 'uls-settings-block--with-add-languages' );
			$ulsSettingsBlock.prepend( $addLanguagesMenuButton );

			// Action menu items need OOUI widgets. Load them and register trigger event handler.
			mw.loader.using( [ 'oojs-ui-widgets', 'oojs-ui.styles.icons-interactions' ] ).then( () => {
				$addLanguagesMenuButton.on( 'click', () => {
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
		let popup = null;
		const configPosition = mw.config.get( 'wgULSPosition' ),
			triggerSelector = ( configPosition === 'interlanguage' ) ?
				'.uls-settings-trigger, .mw-interlanguage-selector' :
				'.uls-trigger';

		// Fallback if no entry point is present
		const trigger = document.querySelector( triggerSelector ) || document.querySelector( '#pt-preferences' );

		// Skip tooltip if there is no element to attach the tooltip to.
		// It will cause errors otherwise.
		if ( !trigger ) {
			return;
		}

		function hideTipsy() {
			popup.toggle( false );
		}

		function showTipsy( timeout ) {
			let tipsyTimer = 0;

			popup.toggle( true );
			popup.toggleClipping( true );

			// if the mouse is over the tooltip, do not hide
			$( '.uls-tipsy' ).on( 'mouseover', () => {
				clearTimeout( tipsyTimer );
			} ).on( 'mouseout', () => {
				tipsyTimer = setTimeout( hideTipsy, timeout );
			} ).on( 'click', hideTipsy );

			tipsyTimer = setTimeout( hideTipsy, timeout );
		}

		let popupPosition;
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

				const $link = $( '<a>' )
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
					.on( 'click', ( event ) => {
						event.preventDefault();

						// Track if event logging is enabled
						mw.hook( 'mw.uls.language.revert' ).fire();

						mw.loader.using( [ 'ext.uls.common' ] ).then( () => {
							mw.uls.changeLanguage( event.target.lang );
						} );
					} );

				let messageKey;
				if ( mw.storage.get( 'uls-gp' ) === '1' ) {
					messageKey = 'ext-uls-undo-language-tooltip-text-local';
				} else {
					messageKey = 'ext-uls-undo-language-tooltip-text';
				}

				// Message keys listed above

				return $( '<p>' ).append( mw.message( messageKey, $link ).parseDom() );
			}() )
		} );

		popup.$element.appendTo( document.body );

		// The interlanguage position needs some time to settle down
		setTimeout( () => {
			// Show the tipsy tooltip on page load.
			showTipsy( 6000 );
		}, 700 );

		// manually show the tooltip
		$( trigger ).on( 'mouseover', () => {
			// show only if the ULS panel is not shown
			// eslint-disable-next-line no-jquery/no-sizzle
			if ( !$( '.uls-menu:visible' ).length ) {
				showTipsy( 3000 );
			}
		} );
	}

	function initSecondaryEntryPoints() {
		$( '.uls-settings-trigger' ).one( 'click', ( e ) => {
			e.preventDefault();
			mw.loader.using( languageSettingsModules, () => {
				$( e.target ).languagesettings();
				$( e.target ).trigger( 'click' );
			} );
		} );
	}

	function initInterlanguageEntryPoint() {
		const $pLang = $( '#p-lang' );

		const $trigger = $( '<button>' )
			.addClass( 'uls-settings-trigger' )
			.prop( 'title', mw.msg( 'ext-uls-select-language-settings-icon-tooltip' ) );

		// Append ULS cog to interlanguage section header in the sidebar
		$pLang.prepend( $trigger );

		// Replace the title of the interlanguage links area from "In other languages" to
		// "Languages" if there are no language links. TODO: Remove this feature?
		if ( !$pLang.find( 'div ul' ).children().length && isUsingStandaloneLanguageButton ) {
			$pLang.find( 'h3' ).text( mw.msg( 'uls-plang-title-languages' ) );
		}

		const clickHandler = function ( e ) {
			const languagesettings = $trigger.data( 'languagesettings' );

			if ( languagesettings ) {
				if ( !languagesettings.shown ) {
					mw.hook( 'mw.uls.settings.open' ).fire( 'interlanguage' );
				}

				return;
			}

			// Initialize the Language settings window
			const languageSettingsOptions = {
				defaultModule: 'display',
				onPosition: function () {
					const ulsTriggerHeight = this.$element.height(),
						ulsTriggerWidth = this.$element[ 0 ].offsetWidth,
						ulsTriggerOffset = this.$element.offset();

					// Same as border width in mixins.less, or near enough
					const caretRadius = 12;

					let left;
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
					const top = ulsTriggerOffset.top +
						( ulsTriggerHeight / 2 ) -
						( caretRadius + 16 );

					return { top: top, left: left };
				},
				onVisible: function () {
					this.$window.addClass( 'callout' );
				}
			};

			mw.loader.using( languageSettingsModules, () => {
				$trigger.languagesettings( languageSettingsOptions ).trigger( 'click' );
			} );

			e.stopPropagation();
		};

		$trigger.on( 'click', clickHandler );
	}

	// Mobile-only route for the fullscreen content language selector. This route only
	// applies to ULS V2 (see isULSV2Enabled guards below);
	const LANGUAGES_ROUTE = '#/languages';

	// Keep in sync with MOBILE_WIDTH_THRESHOLD (768) in UniversalLanguageSelector.vue.
	function isMobileViewport() {
		return window.matchMedia( '(max-width: 767px)' ).matches;
	}

	// The route controller, created when the content selector is first loaded.
	let languageRoute = null;

	// Navigating to the route before the selector has loaded: lazy-load and open via the trigger.
	function openContentSelectorFromRoute() {
		if (
			isULSV2Enabled &&
			!languageRoute &&
			isMobileViewport() &&
			location.hash === LANGUAGES_ROUTE
		) {
			const $trigger = $( '.mw-interlanguage-selector' );
			if ( !$trigger.length && mw.config.get( 'skin' ) === 'minerva' ) {
				// HACK: On Minerva, the mw-interlanguage-selector class maybe added a little late.
				// Try again if the trigger is not found.
				setTimeout( openContentSelectorFromRoute, 500 );
				return;
			}
			$trigger.first().trigger( 'click' );
		}
	}

	/**
	 * Create a controller that keeps the fullscreen mobile content selector in sync
	 * with the URL hash: deep-linkable, and closeable with the browser back button.
	 *
	 * @return {Object} Controller exposing attach(), markNavigating(),
	 *   onVisibleChange() and onRouteChange().
	 */
	function createLanguageRoute() {
		// The mounted selector instance, attached after mount.
		let vm = null;
		// Whether a selection is navigating the page away, so closing skips the
		// history cleanup that would otherwise race the navigation.
		let navigatingAway = false;
		let isMobile = false;

		return {
			attach( instance ) {
				vm = instance;
			},
			markNavigating() {
				navigatingAway = true;
			},
			// Component visibility -> URL. Mobile only.
			onVisibleChange( isVisible, mobile ) {
				isMobile = mobile;
				if ( !isMobile ) {
					return;
				}
				if ( isVisible ) {
					// Tag the entry so closing pops it rather than stripping a hash the
					// user deep-linked to. pushState fires no hashchange, so opening
					// never loops back through onRouteChange.
					if ( location.hash !== LANGUAGES_ROUTE ) {
						history.pushState( { ulsRoute: true }, '', LANGUAGES_ROUTE );
					}
				} else if ( !navigatingAway && location.hash === LANGUAGES_ROUTE ) {
					if ( history.state && history.state.ulsRoute ) {
						history.back();
					} else {
						history.replaceState(
							null, '', location.pathname + location.search
						);
					}
				}
			},
			// URL -> component visibility, for back/forward and manual hash edits.
			// Gated on the component's reported mobile state (see onVisibleChange).
			onRouteChange() {
				if ( !vm || !isMobile ) {
					return;
				}
				const shouldBeVisible = location.hash === LANGUAGES_ROUTE;
				if ( vm.visible !== shouldBeVisible ) {
					vm[ shouldBeVisible ? 'open' : 'close' ]();
				}
			}
		};
	}

	// URL -> selector. Once mounted, the controller drives open/close (gating on the
	// component's own mobile state); before that, bootstrap the lazy-loaded module.
	function syncSelectorToRoute() {
		if ( languageRoute ) {
			languageRoute.onRouteChange();
		} else {
			openContentSelectorFromRoute();
		}
	}

	if ( isULSV2Enabled ) {
		window.addEventListener( 'hashchange', syncSelectorToRoute );

		// Re-sync on bfcache restore to reopen it.
		window.addEventListener( 'pageshow', ( event ) => {
			if ( event.persisted ) {
				syncSelectorToRoute();
			}
		} );
	}

	function initPersonalEntryPoint() {
		const $trigger = $( '.uls-trigger' );

		let clickHandler;
		if ( !userCanChangeLanguage() ) {
			clickHandler = function ( e ) {
				const languagesettings = $trigger.data( 'languagesettings' );

				e.preventDefault();

				if ( languagesettings ) {
					if ( !languagesettings.shown ) {
						mw.hook( 'mw.uls.settings.open' ).fire( 'personal' );
					}
				} else {
					mw.loader.using( languageSettingsModules, () => {
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
				const uls = $trigger.data( 'uls' );

				e.preventDefault();

				if ( isULSV2Enabled ) {
					if ( $trigger.attr( 'data-uls-loaded' ) ) {
						return;
					}
					$trigger.attr( 'data-uls-loaded', true );

					// Capture the trigger synchronously: `e.currentTarget` is only
					// valid during event dispatch and may be reset (e.g. to `document`
					// by a later delegated click handler) by the time this async
					// callback runs, which breaks floating-ui positioning.
					const triggerElement = e.currentTarget;
					mw.loader.using( prefetchRewriteModules() ).then( () => {
						const { createUniversalLanguageSelector } = require( 'ext.uls.rewrite' );

						const mountPoint = document.createElement( 'div' );
						document.body.appendChild( mountPoint );

						const app = createUniversalLanguageSelector( {
							triggerElement: triggerElement,
							selectableLanguages: $.uls.data.getAutonyms(),
							selected: [ mw.config.get( 'wgUserLanguage' ) ],
							onSelect: ( language ) => {
								mw.uls.changeLanguage( language.code );
							},
							mode: 'interface'
						} );
						const mountedVm = app.mount( mountPoint );
						$trigger.on( 'click', ( event ) => {
							event.preventDefault();
							event.stopPropagation();
							mountedVm.toggle();
						} );
					} );
					return;
				}

				if ( uls ) {
					if ( !uls.shown ) {
						mw.hook( 'mw.uls.settings.open' ).fire( 'personal' );
					}
				} else {
					mw.loader.using( 'ext.uls.mediawiki', () => {
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
								const offset = $trigger.offset();
								const width = $trigger.outerWidth();
								const height = $trigger.outerHeight();

								let positionCSS;
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
						setTimeout( () => {
							$trigger.trigger( 'click', eventParams );
						}, 0 );
					} );
				}
			};
		}

		$trigger.on( 'click', clickHandler );
		// Optimization: Prefetch the ResourceLoader modules for ULS on hover/focus
		// so the selector opens without a network round-trip on click.
		$trigger.one( 'pointerenter focus', () => {
			if ( isULSV2Enabled && userCanChangeLanguage() ) {
				prefetchRewriteModules();
			} else {
				mw.loader.load( languageSettingsModules );
			}
		} );
	}

	function initLanguageChangeUndoTooltip() {
		if ( !userCanChangeLanguage() ) {
			return;
		}

		const previousLanguage = mw.storage.get( 'uls-previous-language-code' );
		const currentLanguage = mw.config.get( 'wgUserLanguage' );
		const previousAutonym = mw.storage.get( 'uls-previous-language-autonym' );
		const currentAutonym = require( '../data.json' ).currentAutonym;

		// If storage is empty, i.e. first visit, then store the current language
		// immediately so that we know when it changes.
		if ( !previousLanguage || !previousAutonym ) {
			mw.storage.set( 'uls-previous-language-code', currentLanguage );
			mw.storage.set( 'uls-previous-language-autonym', currentAutonym );
			return;
		}

		if ( previousLanguage !== currentLanguage ) {
			mw.loader.using( 'oojs-ui-core' ).then( () => {
				showUndoTooltip( previousLanguage, previousAutonym );
			} );
			mw.storage.set( 'uls-previous-language-code', currentLanguage );
			mw.storage.set( 'uls-previous-language-autonym', currentAutonym );
			// Store this language in a list of frequently used languages
			mw.loader.using( [ 'ext.uls.common' ] ).then( () => {
				mw.uls.addPreviousLanguage( currentLanguage );
			} );
		}
	}

	function initIme() {
		const imeSelector = mw.config.get( 'wgULSImeSelectors' ).join( ', ' );

		$( document.body ).on( 'focus.imeinit', imeSelector, function () {
			const $input = $( this );
			$( document.body ).off( '.imeinit' );
			mw.loader.using( 'ext.uls.ime', () => {
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
		$( document ).on( 'input', 'input.mw-interlanguage-selector[type="checkbox"]', ( ev ) => {
			const elem = ev.currentTarget;
			elem.checked = false;
		} );

		$( document ).on( 'keydown', 'input.mw-interlanguage-selector[type="checkbox"]', ( ev ) => {
			const elem = ev.currentTarget;
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
		const $target = $( ev.currentTarget );

		// Avoid reinitializing ULS multiple times for an element
		if ( $target.attr( 'data-uls-loaded' ) ) {
			return;
		}
		$target.attr( 'data-uls-loaded', true );

		ev.preventDefault();

		if ( isULSV2Enabled ) {
			const isMinerva = mw.config.get( 'skin' ) === 'minerva';
			mw.loader.using( prefetchRewriteModules() ).then( () => {
				const languageNodes = getLanguageNodes();
				const languageNodesInjected = injectCurrentLanguage( Array.from( languageNodes ) );
				const hideActiveLanguages = languageNodesInjected.length !== languageNodes.length;
				const languageAnnotations = getLanguageAnnotations( languageNodesInjected, isMinerva );
				const variantNodes = Array.from( getVariantNodes() );
				const pageContentLanguage = mw.config.get( 'wgPageContentLanguage' ) ||
					mw.config.get( 'wgContentLanguage' );
				const variantsByLanguage = {};
				const variantAnnotationsByLanguage = {};
				if ( variantNodes.length > 0 && pageContentLanguage ) {
					variantsByLanguage[ pageContentLanguage ] =
						mw.uls.getInterlanguageListFromNodes( variantNodes );
					variantAnnotationsByLanguage[ pageContentLanguage ] =
						getLanguageAnnotations( variantNodes, isMinerva );
				}
				const { createUniversalLanguageSelector } = require( 'ext.uls.rewrite' );
				const { h } = require( 'vue' );

				const mountPoint = document.createElement( 'div' );
				document.body.appendChild( mountPoint );

				languageRoute = createLanguageRoute();

				const app = createUniversalLanguageSelector( {
					// `$target` was captured synchronously above; `ev.currentTarget`
					// is unreliable here as this runs after a later delegated click
					// handler (e.g. Score's) may have reset it to `document`.
					triggerElement: $target[ 0 ],
					selectableLanguages: mw.uls.getInterlanguageListFromNodes( languageNodesInjected ),
					languageAnnotations: languageAnnotations,
					variantsByLanguage: variantsByLanguage,
					variantAnnotationsByLanguage: variantAnnotationsByLanguage,
					selected: [ pageContentLanguage ],
					hideActiveLanguages: hideActiveLanguages,
					onSelect: ( language ) => {
						languageRoute.markNavigating();
						window.location.assign( language.value.href );
					},
					mode: 'content',
					floatingOptions: isMinerva ? { placement: 'bottom-start' } : undefined,
					onVisibleChange: languageRoute.onVisibleChange,
					slots: {
						'language-item': ( { item, annotations, isAvailable } ) => {
							if ( isAvailable ) {
								return h( 'a', {
									href: item.href,
									hreflang: annotations.hreflang,
									title: annotations.linkTitle,
									tabindex: -1
								}, item.text );
							}

							return h( 'span', {
								title: annotations.linkTitle
							}, item );
						}
					}
				} );

				const mountedVm = app.mount( mountPoint );
				languageRoute.attach( mountedVm );
				$target.on( 'click', ( event ) => {
					event.preventDefault();
					event.stopPropagation();
					mountedVm.toggle();
				} );
			} );
			return;
		}

		mw.loader.using( [ 'ext.uls.mediawiki', '@wikimedia/codex' ] ).then( () => {
			const languageNodes = getLanguageNodes();
			const standalone = isUsingStandaloneLanguageButton();

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
				const uls = $target.data( 'uls' );
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
				.one( 'click', '.mw-interlanguage-selector', loadContentLanguageSelector )
				.one( 'pointerenter focus', '.mw-interlanguage-selector', prefetchRewriteModules );
		} else {
			// This button may be created by the new Vector skin, or ext.uls.compactlinks module
			// if there are many languages. Warning: Both this module and ext.uls.compactlinks
			// module may run simultaneously. Using event delegation to avoid race conditions where
			// the trigger may be created after this code.
			$( document ).on( 'click', '.mw-interlanguage-selector', loadContentLanguageSelector );
			// Prefetch the rewrite modules on hover/focus so the selector
			// opens instantly on click. Delegated to handle triggers created later.
			$( document ).one(
				'pointerenter focus',
				'.mw-interlanguage-selector',
				prefetchRewriteModules
			);
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
		const $languageBtn = $( '#p-lang-btn' );
		const clickHandler = function ( event ) {
			event.stopPropagation();
			mw.loader.using( languageSettingsModules ).then( () => {
				$( event.target ).languagesettings( {
					autoOpen: true,
					onPosition: function () {
						const offset = $languageBtn.offset();
						const top = offset.top + $languageBtn.outerHeight();
						const right = $( window ).width() - offset.left - $languageBtn.outerWidth();
						return { top: top, right: right };
					}
				} );
			} );
		};
		// the first time the language button is clicked inside a non-content page,
		// we should add the "Open language settings" button inside the dropdown
		$languageBtn.one( 'mouseover', () => {
			mw.loader.using( [ 'oojs-ui-widgets', 'oojs-ui.styles.icons-interactions', 'ext.uls.messages' ] )
				.then( () => {
					const actionButton = new ActionsMenuItem(
						'settings',
						$.i18n( 'ext-uls-actions-menu-language-settings-item-label' ),
						clickHandler,
						null
					).render();
					actionButton.$element.addClass( 'empty-language-selector__language-settings-button' );
					const $emptyLanguageSelectorBody = $( '.mw-portlet-empty-language-selector-body' );
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

		// show on Minerva if its ULS rewrite
		const isV2LanguageSelectorOnMinerva = mw.config.get( 'skin' ) === 'minerva' &&
			isULSV2Enabled;

		if ( !isV2LanguageSelectorOnMinerva ) {
			// Don't display ime on Minerva skin.
			initIme();
			initLanguageChangeUndoTooltip();
		}

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
		const position = mw.config.get( 'wgULSPosition' );
		if ( position === 'interlanguage' ) {
			initInterlanguageEntryPoint();
		} else {
			initPersonalEntryPoint();
		}

		// whether to load compact language links
		const compact = mw.config.get( 'wgULSisCompactLinksEnabled' );
		// whether to show the omni box or not
		const languageInHeader = mw.config.get( 'wgVector2022LanguageInHeader' );

		if ( compact || languageInHeader || isV2LanguageSelectorOnMinerva ) {
			// Init compact languages OR omni selector using the mw-interlanguage-selector class
			initContentLanguageSelectorClickHandler();
		} else {
			$( '.mw-interlanguage-selector' ).removeClass( 'mw-interlanguage-selector' );
			document.body.classList.add( 'mw-interlanguage-selector-disabled' );
		}

		// Open the fullscreen selector when deep-linked to its route on mobile.
		openContentSelectorFromRoute();
	}

	let languageNodesCache = null;
	function getLanguageNodes() {
		if ( languageNodesCache === null ) {
			const parent = document.querySelectorAll( '.mw-portlet-lang, #p-lang' )[ 0 ];
			languageNodesCache = parent ? parent.querySelectorAll( '.interlanguage-link-target' ) : [];
		}

		return languageNodesCache;
	}

	function getVariantNodes() {
		return document.querySelectorAll( '#p-variants li a' );
	}

	/**
	 * Injects a synthetic node for the current wiki language into the list of language nodes
	 * and ensures the list remains sorted by autonym.
	 *
	 * @param {Array} nodes
	 * @return {Array}
	 */
	function injectCurrentLanguage( nodes ) {
		const contentLang = mw.config.get( 'wgPageContentLanguage' ) || mw.config.get( 'wgContentLanguage' );

		if ( contentLang && !nodes.some( ( el ) => el.lang === contentLang ) ) {
			const syntheticNode = document.createElement( 'a' );
			syntheticNode.lang = contentLang;
			syntheticNode.href = location.href;
			syntheticNode.textContent = require( '../data.json' ).currentAutonym;
			syntheticNode.setAttribute( 'data-title', mw.config.get( 'wgTitle' ) );

			// Ensure it has a parent for class lookups in getLanguageAnnotations
			const parent = document.createElement( 'li' );
			parent.className = 'interlanguage-link interwiki-' + contentLang;
			parent.appendChild( syntheticNode );

			nodes.push( syntheticNode );
			// We don't bother sorting the list since we hide the selected language.
		}

		return nodes;
	}

	function getLanguageAnnotations( languageNodes, includeDescriptions ) {
		const annotations = {};

		let titleAttribute = 'data-title';
		if ( includeDescriptions ) {
			const firstLanguageNode = languageNodes[ 0 ];
			// FIXME: Ugly, brittle check to determine if we should use title or data-title attribute.
			// We use title if its page translation, and data-title if its anything else.
			if ( firstLanguageNode ) {
				const isPageTranslation = firstLanguageNode
					.parentElement
					.classList
					.contains( 'interwiki-pagetranslation' );
				if ( isPageTranslation ) {
					titleAttribute = 'title';
				}
			}
		}

		Array.prototype.forEach.call( languageNodes, ( node ) => {
			const lang = mw.uls.convertMediaWikiLanguageCodeToULS( node.lang );
			if ( lang ) {
				annotations[ lang ] = {
					classes: Array.from( node.parentElement.classList ),
					hreflang: node.hreflang,
					linkTitle: node.title
				};

				if ( includeDescriptions ) {
					annotations[ lang ].description = node.getAttribute( titleAttribute ) || '';
				}
			}
		} );

		return annotations;
	}

	// Early execute of init
	if ( document.readyState === 'interactive' ) {
		init();
	} else {
		$( init );
	}

}() );
