'use strict';

const { onMounted, nextTick } = require( 'vue' );
const EntrypointRegistry = require( 'ext.uls.rewrite.entrypoints' );
const { ENTRYPOINT_TYPE } = EntrypointRegistry;

/**
 * Composable for managing ULS entrypoints.
 *
 * @param {string} mode - The ULS mode ('interface' or 'content').
 * @return {Object} Object containing registered entrypoints.
 */
module.exports = function useEntrypoints( mode ) {
	const quickActionEntrypoints =
		EntrypointRegistry.getRegisteredEntrypoints( ENTRYPOINT_TYPE.QUICK_ACTIONS, mode );
	const emptyLanguageListEntrypoints =
		EntrypointRegistry.getRegisteredEntrypoints( ENTRYPOINT_TYPE.EMPTY_LIST, mode );
	const emptySearchEntrypoints =
		EntrypointRegistry.getRegisteredEntrypoints( ENTRYPOINT_TYPE.EMPTY_SEARCH, mode );
	const missingLanguageEntrypoints =
		EntrypointRegistry.getRegisteredEntrypoints( ENTRYPOINT_TYPE.MISSING_CONTENT_LANGUAGES, mode );

	onMounted( async () => {
		await nextTick();
		// Lock the registry to ensure that further entrypoints cannot be added.
		// Trying to add entrypoints now will cause errors to be thrown.
		EntrypointRegistry.lock();
	} );

	return {
		quickActionEntrypoints,
		emptyLanguageListEntrypoints,
		emptySearchEntrypoints,
		missingLanguageEntrypoints
	};
};
