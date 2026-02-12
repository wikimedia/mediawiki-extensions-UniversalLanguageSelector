'use strict';

const { computed, Ref } = require( 'vue' );

/**
 * @param {Ref<string>} searchQuery
 * @param {Ref<Array>} languagesToDisplay Array of language codes
 * @param {Ref<Object>} languages Map of code to string or object {text: string}
 * @return {Object}
 */
module.exports = function useTypeahead( searchQuery, languagesToDisplay, languages ) {
	const getLanguageLabel = ( code ) => {
		const lang = languages.value[ code ];
		if ( !lang ) {
			return '';
		}
		return typeof lang === 'object' ? lang.text : lang;
	};

	const autocompleteSuggestion = computed( () => {
		const query = searchQuery.value && searchQuery.value.trim();

		if ( !query || languagesToDisplay.value.length === 0 ) {
			return '';
		}

		// Find the first match in the current filtered list
		const firstMatchCode = languagesToDisplay.value[ 0 ];
		const firstMatchLabel = getLanguageLabel( firstMatchCode );

		// Scenario A: Query matches the start of the Label (e.g., "Hind" -> "i")
		if ( firstMatchLabel.toLowerCase().startsWith( query.toLowerCase() ) ) {
			return firstMatchLabel.slice( query.length );
		}

		// Scenario B: Query matches the Code (e.g., "hi" -> " - Hindi")
		if ( firstMatchCode.startsWith( query ) ) {
			const remainingCode = firstMatchCode.slice( query.length );
			return `${ remainingCode } — ${ firstMatchLabel }`;
		}

		return '';
	} );

	const getAcceptedSuggestion = () => {
		if ( autocompleteSuggestion.value ) {
			const firstMatchCode = languagesToDisplay.value[ 0 ];
			return getLanguageLabel( firstMatchCode );
		}
		return null;
	};

	return {
		autocompleteSuggestion,
		getAcceptedSuggestion
	};
};
