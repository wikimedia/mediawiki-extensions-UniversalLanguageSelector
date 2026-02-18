'use strict';

const { watch, onMounted, onBeforeUnmount } = require( 'vue' );

/**
 * Composable to detect clicks outside a specified element.
 *
 * @param {Object} elementRef Ref to element to detect clicks outside of.
 * @param {Object} visibleRef Indicates if the element is visible.
 * @param {Document} document The document object to attach event listeners to.
 * @param {Function} callback Function to call when a click outside occurs.
 */
function useClickOutside( elementRef, visibleRef, document, callback ) {
	const onClickOutside = ( event ) => {
		const isClickOnElement = elementRef.value && elementRef.value.contains( event.target );
		if ( !isClickOnElement ) {
			callback();
		}
	};

	watch( visibleRef, ( isVisible ) => {
		if ( isVisible ) {
			document.addEventListener( 'click', onClickOutside );
		} else {
			document.removeEventListener( 'click', onClickOutside );
		}
	} );

	onMounted( () => {
		if ( visibleRef.value ) {
			document.addEventListener( 'click', onClickOutside );
		}
	} );

	onBeforeUnmount( () => {
		document.removeEventListener( 'click', onClickOutside );
	} );
}

module.exports = useClickOutside;
