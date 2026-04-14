'use strict';

const { computed } = require( 'vue' );
const useCountryCode = require( './useCountryCode.js' );
const languageData = require( '../../language-data.json' );

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
 *
 * @return {Object}
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

	const { getCountryCode } = useCountryCode();

	const getSuggestedLanguages =
		( previousLanguages, validLanguageCodes ) => computed( () => {
			const countryCode = getCountryCode();
			const territoryLanguages = ( countryCode && languageData.territories[ countryCode ] ) || [];

			const possibleSuggestedLanguages = [
				...previousLanguages.value,
				// User's current interface language
				mw.config.get( 'wgUserLanguage' ),
				// Current wiki's content language
				mw.config.get( 'wgContentLanguage' ),
				browserLanguage,
				...acceptLanguages,
				// Languages spoken in the user's territory
				...territoryLanguages
			];

			// Filter out duplicates and empty values
			const suggestedLanguages = [ ...new Set( possibleSuggestedLanguages ) ].filter( Boolean );

			if ( !validLanguageCodes || !validLanguageCodes.value ) {
				return suggestedLanguages;
			}

			const validLanguageCodesSet = new Set( validLanguageCodes.value );
			return suggestedLanguages.filter(
				( language ) => validLanguageCodesSet.has( language )
			);
		} );

	return { getSuggestedLanguages };
};
