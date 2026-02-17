'use strict';

const { computed, ComputedRef } = require( 'vue' );

/**
 * Normalizes a BCP 47 language tag to its primary language subtag
 * by stripping any region/script suffixes (e.g. "en-US" → "en").
 *
 * @param {string} languageCode
 * @return {string}
 */
function primaryLanguageSubtag( languageCode ) {
	return languageCode.split( '-' )[ 0 ];
}

/**
 * Returns an array of suggested language codes
 * based on a list of criteria. Based on mw.uls.getFrequentLanguageList
 * NOTE: Suggested language codes based on user territory is not supported
 *
 * @return {function(ComputedRef<string[]>):ComputedRef<string[]>}
 */
module.exports = function useSuggestedSourceLanguages() {
	/**
	 * Browser user interface language or the system language.
	 *
	 * @type {string}
	 */
	const browserLanguage = primaryLanguageSubtag( navigator.language || '' );

	/**
	 * Browser accept-languages.
	 *
	 * @type {string[]}
	 */
	const acceptLanguages = (
		mw.config.get( 'wgULSAcceptLanguageList' ) ||
		navigator.languages ||
		[]
	).map( primaryLanguageSubtag );

	const getSuggestedLanguages =
		( validLanguageCodes, previousLanguages ) => computed( () => {
			const suggestedLanguages = [
				...previousLanguages.value,
				// User's current interface language
				mw.config.get( 'wgUserLanguage' ),
				// Current wiki's content language
				mw.config.get( 'wgContentLanguage' ),
				browserLanguage,
				...acceptLanguages
				// TODO: Get suggested languages based on user territory when
				// language-data library is included.
			];

			// Filter out duplicate or invalid languages
			const validLanguageCodesSet = new Set( validLanguageCodes.value );
			return [ ...new Set( suggestedLanguages ) ].filter(
				( language ) => validLanguageCodesSet.has( language )
			);
		} );

	return { getSuggestedLanguages };
};
