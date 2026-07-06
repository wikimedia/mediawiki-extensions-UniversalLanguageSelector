'use strict';

const { ref } = require( 'vue' );
const useKeyboardNavigation = require( '../../../resources/ext.uls.rewrite/composables/useKeyboardNavigation.js' );

describe( 'useKeyboardNavigation', () => {
	let languages;
	let visible;
	let onHighlight;

	beforeEach( () => {
		languages = ref( [ 'en', 'fr', 'es' ] );
		visible = ref( true );
		onHighlight = jest.fn();
	} );

	it( 'initializes with no highlight', () => {
		const { highlightedIndex, highlightedItem } = useKeyboardNavigation(
			languages,
			visible,
			onHighlight
		);

		expect( highlightedIndex.value ).toBe( -1 );
		expect( highlightedItem.value ).toBe( '' );
		expect( onHighlight ).not.toHaveBeenCalled();
	} );

	describe( 'next()', () => {
		it( 'increments index, updates item, calls onHighlight, and wraps around at the end', () => {
			const { next, highlightedIndex, highlightedItem } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight
			);

			// First next() -> 'en' (index 0)
			next();
			expect( highlightedIndex.value ).toBe( 0 );
			expect( highlightedItem.value ).toBe( 'en' );
			expect( onHighlight ).toHaveBeenCalledTimes( 1 );

			// Second next() -> 'fr' (index 1)
			next();
			expect( highlightedIndex.value ).toBe( 1 );
			expect( highlightedItem.value ).toBe( 'fr' );
			expect( onHighlight ).toHaveBeenCalledTimes( 2 );

			// Third next() -> 'es' (index 2)
			next();
			expect( highlightedIndex.value ).toBe( 2 );
			expect( highlightedItem.value ).toBe( 'es' );
			expect( onHighlight ).toHaveBeenCalledTimes( 3 );

			// Fourth next() wraps around -> 'en' (index 0)
			next();
			expect( highlightedIndex.value ).toBe( 0 );
			expect( highlightedItem.value ).toBe( 'en' );
			expect( onHighlight ).toHaveBeenCalledTimes( 4 );
		} );
	} );

	describe( 'prev()', () => {
		it( 'decrements index, updates item, calls onHighlight, and wraps around to the end', () => {
			const { prev, highlightedIndex, highlightedItem } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight
			);

			// First prev() wraps to end -> 'es' (index 2)
			prev();
			expect( highlightedIndex.value ).toBe( 2 );
			expect( highlightedItem.value ).toBe( 'es' );
			expect( onHighlight ).toHaveBeenCalledTimes( 1 );

			// Second prev() -> 'fr' (index 1)
			prev();
			expect( highlightedIndex.value ).toBe( 1 );
			expect( highlightedItem.value ).toBe( 'fr' );
			expect( onHighlight ).toHaveBeenCalledTimes( 2 );

			// Third prev() -> 'en' (index 0)
			prev();
			expect( highlightedIndex.value ).toBe( 0 );
			expect( highlightedItem.value ).toBe( 'en' );
			expect( onHighlight ).toHaveBeenCalledTimes( 3 );

			// Fourth prev() wraps to end -> 'es' (index 2)
			prev();
			expect( highlightedIndex.value ).toBe( 2 );
			expect( highlightedItem.value ).toBe( 'es' );
			expect( onHighlight ).toHaveBeenCalledTimes( 4 );
		} );
	} );

	describe( 'nextPage()', () => {
		it( 'jumps forward by pageSize and clamps at the end without wrapping', () => {
			const { next, nextPage, highlightedIndex } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight,
				2
			);

			next(); // highlight 'en' (index 0)
			expect( highlightedIndex.value ).toBe( 0 );

			nextPage(); // 0 + 2 -> 'es' (index 2)
			expect( highlightedIndex.value ).toBe( 2 );
			expect( onHighlight ).toHaveBeenCalledTimes( 2 );

			// Already at the last item: clamps, does not wrap
			nextPage();
			expect( highlightedIndex.value ).toBe( 2 );
			expect( onHighlight ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'moves from no highlight to the end of the first page', () => {
			const { nextPage, highlightedIndex } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight,
				2
			);

			nextPage(); // -1 + 2 -> 'fr' (index 1)
			expect( highlightedIndex.value ).toBe( 1 );
			expect( onHighlight ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does nothing if language list is empty', () => {
			languages.value = [];
			const { nextPage, highlightedIndex } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight,
				2
			);

			nextPage();
			expect( highlightedIndex.value ).toBe( -1 );
			expect( onHighlight ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'prevPage()', () => {
		it( 'jumps back by pageSize and clamps at the start without wrapping', () => {
			const { setHighlightedItem, prevPage, highlightedIndex } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight,
				2
			);

			setHighlightedItem( 'es' ); // index 2
			expect( highlightedIndex.value ).toBe( 2 );

			prevPage(); // 2 - 2 -> 'en' (index 0)
			expect( highlightedIndex.value ).toBe( 0 );
			expect( onHighlight ).toHaveBeenCalledTimes( 2 );

			// Already at the first item: clamps, does not wrap
			prevPage();
			expect( highlightedIndex.value ).toBe( 0 );
			expect( onHighlight ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'does nothing if language list is empty', () => {
			languages.value = [];
			const { prevPage, highlightedIndex } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight,
				2
			);

			prevPage();
			expect( highlightedIndex.value ).toBe( -1 );
			expect( onHighlight ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'highlightFirst()', () => {
		it( 'does nothing if language list is empty', () => {
			languages.value = [];
			const { highlightFirst, highlightedIndex, highlightedItem } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight
			);

			highlightFirst();
			expect( highlightedIndex.value ).toBe( -1 );
			expect( highlightedItem.value ).toBe( '' );
			expect( onHighlight ).not.toHaveBeenCalled();
		} );

		it( 'highlights the first item and calls onHighlight if list is not empty', () => {
			const { highlightFirst, highlightedIndex, highlightedItem } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight
			);

			highlightFirst();
			expect( highlightedIndex.value ).toBe( 0 );
			expect( highlightedItem.value ).toBe( 'en' );
			expect( onHighlight ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'setHighlightedItem()', () => {
		it( 'does nothing if language code is not found in the list', () => {
			const { setHighlightedItem, highlightedIndex, highlightedItem } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight
			);

			setHighlightedItem( 'de' );
			expect( highlightedIndex.value ).toBe( -1 );
			expect( highlightedItem.value ).toBe( '' );
			expect( onHighlight ).not.toHaveBeenCalled();
		} );

		it( 'highlights the found language and calls onHighlight', () => {
			const { setHighlightedItem, highlightedIndex, highlightedItem } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight
			);

			setHighlightedItem( 'fr' );
			expect( highlightedIndex.value ).toBe( 1 );
			expect( highlightedItem.value ).toBe( 'fr' );
			expect( onHighlight ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'clearHighlightedItem()', () => {
		it( 'resets the index to -1 but does not call onHighlight', () => {
			const { next, clearHighlightedItem, highlightedIndex, highlightedItem } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight
			);

			next(); // highlight 'en' (index 0)
			expect( highlightedIndex.value ).toBe( 0 );

			clearHighlightedItem();
			expect( highlightedIndex.value ).toBe( -1 );
			expect( highlightedItem.value ).toBe( '' );
			expect( onHighlight ).toHaveBeenCalledTimes( 1 ); // Only called during next()
		} );
	} );

	describe( 'watch(visible)', () => {
		it( 'resets highlight when visible changes', async () => {
			const { next, highlightedIndex } = useKeyboardNavigation(
				languages,
				visible,
				onHighlight
			);

			next(); // highlight 'en' (index 0)
			expect( highlightedIndex.value ).toBe( 0 );

			visible.value = false;
			// Wait for Vue watcher to run
			await visible.value;
			expect( highlightedIndex.value ).toBe( -1 );
		} );
	} );
} );
