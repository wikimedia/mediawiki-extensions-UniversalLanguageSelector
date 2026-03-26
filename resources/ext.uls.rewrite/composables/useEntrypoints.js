'use strict';

const { onMounted, nextTick } = require( 'vue' );
const EntrypointRegistry = require( 'ext.uls.rewrite.entrypoints' );

/**
 * Composable for managing ULS entrypoints.
 *
 * @param {string} mode - The ULS mode ('interface' or 'content').
 * @return {Object} Object containing registered entrypoints.
 */
module.exports = function useEntrypoints( mode ) {
	const quickActions = EntrypointRegistry.getRegisteredEntrypoints( 'quick-actions', mode );
	const emptyLanguageListActions =
		EntrypointRegistry.getRegisteredEntrypoints( 'empty-list', mode );
	const emptySearchActions =
		EntrypointRegistry.getRegisteredEntrypoints( 'empty-search', mode );
	const missingLanguagesActions =
		EntrypointRegistry.getRegisteredEntrypoints( 'missing-languages', mode );

	onMounted( async () => {
		await nextTick();
		// Lock the registry to ensure that further entrypoints cannot be added.
		// Trying to add entrypoints now will cause errors to be thrown.
		EntrypointRegistry.lock();
	} );

	return {
		quickActions,
		emptyLanguageListActions,
		emptySearchActions,
		missingLanguagesActions
	};
};
