'use strict';

const { watch, onBeforeUnmount } = require( 'vue' );

// Elements that can receive keyboard focus. Disabled controls and elements
// removed from the tab order via tabindex="-1" (e.g. the language links,
// which are reached via aria-activedescendant instead) are excluded.
const FOCUSABLE_SELECTOR = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]'
].map( ( selector ) => selector + ':not([tabindex="-1"])' ).join( ', ' );

/**
 * Composable to keep Tab/Shift+Tab focus movement inside a container while
 * active. Used on mobile, where the selector is a fullscreen modal
 * (aria-modal="true") but the page behind it stays in the DOM and would
 * otherwise receive focus.
 *
 * @param {Object} containerRef Ref to the element to trap focus within.
 * @param {Object} activeRef Whether the trap should be active.
 * @param {Document} document The document object to attach event listeners to.
 */
function useFocusTrap( containerRef, activeRef, document ) {
	const getFocusable = () => Array.prototype.filter.call(
		containerRef.value.querySelectorAll( FOCUSABLE_SELECTOR ),
		// Skip elements that are not rendered or are hidden from assistive
		// technology via an aria-hidden ancestor (e.g. the typeahead ghost
		// input): moving focus to those would strand keyboard users.
		( element ) => element.getClientRects().length > 0 &&
			!element.closest( '[aria-hidden="true"]' )
	);

	const onKeydown = ( event ) => {
		if ( event.key !== 'Tab' || !containerRef.value ) {
			return;
		}

		const focusable = getFocusable();
		if ( focusable.length === 0 ) {
			event.preventDefault();
			return;
		}

		const first = focusable[ 0 ];
		const last = focusable[ focusable.length - 1 ];
		const current = document.activeElement;

		if ( !containerRef.value.contains( current ) ) {
			// Focus escaped the modal (or never entered it): pull it back in.
			event.preventDefault();
			first.focus();
		} else if ( event.shiftKey && current === first ) {
			event.preventDefault();
			last.focus();
		} else if ( !event.shiftKey && current === last ) {
			event.preventDefault();
			first.focus();
		}
	};

	watch( activeRef, ( isActive ) => {
		if ( isActive ) {
			// Capture phase, so the trap wins over any stopPropagation in
			// component-level keydown handlers.
			document.addEventListener( 'keydown', onKeydown, true );
		} else {
			document.removeEventListener( 'keydown', onKeydown, true );
		}
	}, { immediate: true } );

	onBeforeUnmount( () => {
		document.removeEventListener( 'keydown', onKeydown, true );
	} );
}

module.exports = useFocusTrap;
