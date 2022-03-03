/*!
 * A simple dialog to be used inside ULS.
 *
 * @private
 * @since 2020.01
 *
 * Copyright (C) 2019-2020 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
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

	var ULSDialog = function ( options ) {
		var $dialog = options.container,
			hasOverlay = options.hasOverlay,
			$overlay,
			// Source: https://github.com/ghosh/Micromodal/blob/master/lib/src/index.js#L4
			FOCUSABLE_NODES = [
				'a[href]',
				'area[href]',
				'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
				'select:not([disabled]):not([aria-hidden])',
				'textarea:not([disabled]):not([aria-hidden])',
				'button:not([disabled]):not([aria-hidden])',
				'iframe',
				'object',
				'embed',
				'[contenteditable]',
				'[tabindex]:not([tabindex^="-"])'
			],
			afterOpen = options.afterOpen,
			afterClose = options.afterClose;

		function getFocusableNodes() {
			return $dialog.find( FOCUSABLE_NODES.join( ', ' ) );
		}

		function isElementInDialog( targetElement ) {
			return $dialog.get( 0 ).contains( targetElement );
		}

		function focusOverlay() {
			if ( $overlay ) {
				$overlay.get( 0 ).focus();
			}
		}

		function focusFirstNodeOrOverlay( $focusableNodes ) {
			if ( $focusableNodes === undefined ) {
				$focusableNodes = getFocusableNodes();
			}

			if ( $focusableNodes.length ) {
				$focusableNodes.get( 0 ).focus();
			} else {
				focusOverlay();
			}
		}

		function maintainFocus( event ) {
			var $focusableNodes = getFocusableNodes(),
				focusedItemIndex;

			if ( !hasOverlay ) {
				// overlay is not present, so let tabbing flow as normal.
				return;
			}

			if ( !$focusableNodes.length ) {
				// no focusable node in the dialog, focus on the overlay.
				focusOverlay();
				return;
			}

			if ( !isElementInDialog( document.activeElement ) ) {
				focusFirstNodeOrOverlay( $focusableNodes );
			} else {
				focusedItemIndex = $focusableNodes.index( document.activeElement );

				if ( event.shiftKey && focusedItemIndex === 0 ) {
					$focusableNodes.get( -1 ).focus();
					event.preventDefault();
				} else if ( !event.shiftKey && focusedItemIndex === $focusableNodes.length - 1 ) {
					focusFirstNodeOrOverlay( $focusableNodes );
					event.preventDefault();
				}
			}
		}

		function handleFirstFocus( event ) {
			if ( !hasOverlay ) {
				// Overlay is not present, so let tabbing flow as normal.
				return;
			}

			if ( isElementInDialog( event.target ) ) {
				return;
			}

			focusFirstNodeOrOverlay();
		}

		function onKeydown( event ) {
			switch ( event.key ) {
				case 'Esc':
				case 'Escape':
					close();
					event.preventDefault();
					break;
				case 'Tab':
					maintainFocus( event );
					break;
			}
		}

		function addEvents() {
			$( document )
				.on( 'keydown', onKeydown )
				.on( 'focusin', handleFirstFocus );
		}

		function removeEvents() {
			$( document )
				.off( 'keydown', onKeydown )
				.off( 'focusin', handleFirstFocus );
		}

		function showOverlay() {
			if ( $overlay ) {
				$overlay.show();
				$( document.body ).addClass( 'uls-no-overflow' );
			}
		}

		function hideOverlay() {
			if ( $overlay ) {
				$overlay.hide();
				$( document.body ).removeClass( 'uls-no-overflow' );
			}
		}

		function open() {
			$dialog.show();
			addEvents();
			showOverlay();
			focusFirstNodeOrOverlay();
			if ( afterOpen ) {
				afterOpen();
			}
		}

		function close() {
			$dialog.hide();
			removeEvents();
			hideOverlay();
			if ( afterClose ) {
				afterClose();
			}
		}

		function elem() {
			return $dialog;
		}

		function addOverlay() {
			// Check if overlay is already there.
			if ( !$overlay ) {
				$overlay = $( '<div>' )
					.addClass( 'uls-overlay' )
					.prop( 'tabindex', '-1' )
					.on( 'click', close )
					.appendTo( document.body );
			}
		}

		$dialog.addClass( 'uls-dialog' );

		if ( hasOverlay ) {
			addOverlay();
		}

		return {
			open: open,
			close: close,
			elem: elem
		};
	};

	mw.uls = mw.uls || {};
	mw.uls.Dialog = ULSDialog;
}() );
