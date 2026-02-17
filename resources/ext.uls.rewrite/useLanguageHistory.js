'use strict';

const { ref, Ref } = require( 'vue' );

/**
 * Composable for managing a user's language history
 *
 * Handles persistence and access of previously selected source languages
 * stored in localStorage under the key "uls-previous-languages"
 *
 * Copied from ContentTranslation codebase
 *
 * @return {Object} Object containing previousLanguages ref and management functions
 */
module.exports = function useLanguageHistory() {
	/**
	 * Previously used languages by user. These languages are set in local
	 * storage by MediaWiki ULS extension. Since it is NOT guaranteed that
	 * these items are set in local storage, these languages are allowed
	 * to be empty
	 *
	 * @type {Ref<string[]>}
	 */
	const previousLanguages = ref( [] );

	const PREVIOUS_LANGUAGE_STORAGE_KEY = 'uls-previous-languages';
	const MAX_PREVIOUS_LANGUAGES = 8;

	/**
	 * Load language history from localStorage
	 */
	const loadFromStorage = () => {
		try {
			const stored = mw.storage.get( PREVIOUS_LANGUAGE_STORAGE_KEY );

			if ( stored ) {
				previousLanguages.value.push( ...JSON.parse( stored ) );
			}
		} catch ( e ) {
			// Ignore parsing errors - start with an empty array
		}
	};

	/**
	 * Save language history to localStorage
	 */
	const saveToStorage = () => {
		mw.storage.set(
			PREVIOUS_LANGUAGE_STORAGE_KEY,
			JSON.stringify( previousLanguages.value )
		);
	};

	/**
	 * Add a language to the history, moving it to the front of the list
	 * and removing any duplicates. Automatically saves to storage.
	 *
	 * @param {string} language - Language code to add
	 */
	const addLanguageToHistory = ( language ) => {
		if ( !language ) {
			return;
		}

		previousLanguages.value = [
			language,
			...previousLanguages.value.filter( ( lang ) => lang !== language )
		].slice( 0, MAX_PREVIOUS_LANGUAGES );

		// Save immediately after adding
		saveToStorage();
	};

	// Load immediately when composable is created
	loadFromStorage();

	return {
		previousLanguages,
		addLanguageToHistory
	};
};
