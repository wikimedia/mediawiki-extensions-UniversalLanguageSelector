'use strict';

const { watch, onBeforeUnmount } = require( 'vue' );

/**
 * Composable to detect clicks outside a specified element.
 *
 * @param {Object} elementRef Ref to element to detect clicks outside of.
 * @param {Object} activeRef Whether the listener should be activated.
 * @param {Document} document The document object to attach event listeners to.
 * @param {Function} callback Function to call when a click outside occurs.
 */
function useClickOutside( elementRef, activeRef, document, callback ) {
	const onClickOutside = ( event ) => {
		const isClickOnElement = elementRef.value && elementRef.value.contains( event.target );
		if ( !isClickOnElement ) {
			callback();
		}
	};

	watch( activeRef, ( isActive ) => {
		if ( isActive ) {
			document.addEventListener( 'click', onClickOutside );
		} else {
			document.removeEventListener( 'click', onClickOutside );
		}
	}, { immediate: true } );

	onBeforeUnmount( () => {
		document.removeEventListener( 'click', onClickOutside );
	} );
}

module.exports = useClickOutside;
