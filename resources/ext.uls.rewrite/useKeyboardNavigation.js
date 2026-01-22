'use strict';

const { ref, watch, computed, Ref } = require( 'vue' );

/**
 * Custom composable to handle basic keyboard navigation.
 *
 * @param {Ref} languages
 * @param {Ref} visible
 * @param {Function} onHighlight called when the highlight changes.
 * @return {Object} next, prev, selectedItem, setCurrentSelection
 */
function useKeyboardNavigation( languages, visible, onHighlight ) {
	const highlightedIndex = ref( -1 );

	const highlightedItem = computed( () => highlightedIndex.value >= 0 ? languages.value[ highlightedIndex.value ] : '' );

	const next = () => {
		highlightedIndex.value++;

		if ( highlightedIndex.value >= languages.value.length ) {
			highlightedIndex.value = 0;
		}

		onHighlight();
	};

	const prev = () => {
		highlightedIndex.value--;

		if ( highlightedIndex.value < 0 ) {
			highlightedIndex.value = 0;
		}

		onHighlight();
	};

	const highlightFirst = () => {
		if ( languages.value.length > 0 ) {
			highlightedIndex.value = 0;

			onHighlight();
		}
	};

	const setHighlightedItem = ( languageCode ) => {
		const index = languages.value.indexOf( languageCode );

		if ( index !== -1 ) {
			highlightedIndex.value = index;

			onHighlight();
		}
	};

	const clearHighlightedItem = () => {
		highlightedIndex.value = -1;
	};

	watch( visible, async ( isVisible ) => {
		if ( !isVisible ) {
			highlightedIndex.value = -1;
		}
	} );

	return {
		next,
		prev,
		highlightedItem,
		setHighlightedItem,
		highlightFirst,
		clearHighlightedItem
	};
}

module.exports = useKeyboardNavigation;
