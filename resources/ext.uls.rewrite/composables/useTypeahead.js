'use strict';

const { computed, Ref } = require( 'vue' );

/**
 * @param {Ref<string>} searchQuery
 * @param {Ref<Array>} languagesToDisplay Array of language codes
 * @param {Ref<Object>} languages Map of code to string or object {text: string}
 * @param {Ref<Object>} searchQueryHits Map of code to matching label
 * @return {Object}
 */
module.exports = function useTypeahead(
	searchQuery,
	languagesToDisplay,
	languages,
	searchQueryHits
) {
	const getLanguageLabel = ( code ) => {
		const lang = languages.value[ code ];
		if ( !lang ) {
			return '';
		}
		return typeof lang === 'object' ? lang.text : lang;
	};

	const fullSuggestionText = computed( () => {
		const query = searchQuery.value && searchQuery.value.trim();
		if ( !query || !languagesToDisplay.value.length ) {
			return '';
		}

		const firstMatchCode = languagesToDisplay.value[ 0 ];
		const firstMatchLabel = getLanguageLabel( firstMatchCode );

		// Scenario A: Query matches the Label
		if ( firstMatchLabel.toLowerCase().startsWith( query.toLowerCase() ) ) {
			return firstMatchLabel;
		}

		// Scenario B: Query matches the Code (e.g., "hi" -> "hi — Hindi")
		if ( firstMatchCode.startsWith( query ) ) {
			return `${ firstMatchCode } — ${ firstMatchLabel }`;
		}

		// Scenario C: Query matches a hit in searchQueryHits
		const hitLabel = searchQueryHits &&
			searchQueryHits.value &&
			searchQueryHits.value[ firstMatchCode ];
		if (
			hitLabel &&
			hitLabel.toLowerCase().startsWith( query.toLowerCase() )
		) {
			return hitLabel;
		}

		return '';
	} );

	// Visually append only the remainder of the suggestion to the input
	const autocompleteSuggestion = computed( () => {
		const fullText = fullSuggestionText.value;
		const query = searchQuery.value && searchQuery.value.trim();

		if ( fullText && query ) {
			return fullText.slice( query.length );
		}

		return '';
	} );

	// Return the entire suggestion when the user hits Tab/Enter
	const getAcceptedSuggestion = () => fullSuggestionText.value || null;

	return {
		autocompleteSuggestion,
		getAcceptedSuggestion
	};
};
