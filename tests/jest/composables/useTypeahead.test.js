'use strict';

const { ref } = require( 'vue' );
const useTypeahead = require( '../../../resources/ext.uls.rewrite/composables/useTypeahead.js' );

describe( 'useTypeahead', () => {
	let searchQuery;
	let languagesToDisplay;
	let languages;
	let searchQueryHits;

	beforeEach( () => {
		searchQuery = ref( '' );
		languagesToDisplay = ref( [] );
		languages = ref( {} );
		searchQueryHits = ref( {} );
	} );

	it( 'returns empty suggestion when query is empty', () => {
		const { autocompleteSuggestion, getAcceptedSuggestion } = useTypeahead(
			searchQuery,
			languagesToDisplay,
			languages,
			searchQueryHits
		);

		expect( autocompleteSuggestion.value ).toBe( '' );
		expect( getAcceptedSuggestion() ).toBeNull();
	} );

	it( 'returns empty suggestion when languagesToDisplay is empty', () => {
		searchQuery.value = 'fre';
		const { autocompleteSuggestion, getAcceptedSuggestion } = useTypeahead(
			searchQuery,
			languagesToDisplay,
			languages,
			searchQueryHits
		);

		expect( autocompleteSuggestion.value ).toBe( '' );
		expect( getAcceptedSuggestion() ).toBeNull();
	} );

	it( 'returns empty suggestion when the first displayed code has no found in languages', () => {
		searchQuery.value = 'fre';
		languagesToDisplay.value = [ 'fr' ];
		languages.value = { de: 'German' };

		const { autocompleteSuggestion, getAcceptedSuggestion } = useTypeahead(
			searchQuery,
			languagesToDisplay,
			languages,
			searchQueryHits
		);

		expect( autocompleteSuggestion.value ).toBe( '' );
		expect( getAcceptedSuggestion() ).toBeNull();
	} );

	describe( 'Scenario A: Query matches the Label', () => {
		it( 'suggests the remaining label part (case-insensitive)', () => {
			searchQuery.value = 'fre';
			languagesToDisplay.value = [ 'fr' ];
			languages.value = { fr: 'French' };

			const { autocompleteSuggestion, getAcceptedSuggestion } = useTypeahead(
				searchQuery,
				languagesToDisplay,
				languages,
				searchQueryHits
			);

			expect( autocompleteSuggestion.value ).toBe( 'nch' );
			expect( getAcceptedSuggestion() ).toBe( 'French' );
		} );

		it( 'supports languages objects with a text property', () => {
			searchQuery.value = 'Fre';
			languagesToDisplay.value = [ 'fr' ];
			languages.value = { fr: { text: 'French' } };

			const { autocompleteSuggestion, getAcceptedSuggestion } = useTypeahead(
				searchQuery,
				languagesToDisplay,
				languages,
				searchQueryHits
			);

			expect( autocompleteSuggestion.value ).toBe( 'nch' );
			expect( getAcceptedSuggestion() ).toBe( 'French' );
		} );
	} );

	describe( 'Scenario B: Query matches the Code', () => {
		it( 'suggests code and label mapping when label does not match query prefix', () => {
			// Query = 'hi', label = 'हिन्दी' ('हिन्दी' does not start with 'hi')
			searchQuery.value = 'hi';
			languagesToDisplay.value = [ 'hi' ];
			languages.value = { hi: 'हिन्दी' };

			const { autocompleteSuggestion, getAcceptedSuggestion } = useTypeahead(
				searchQuery,
				languagesToDisplay,
				languages,
				searchQueryHits
			);

			expect( autocompleteSuggestion.value ).toBe( ' — हिन्दी' );
			expect( getAcceptedSuggestion() ).toBe( 'hi — हिन्दी' );
		} );
	} );

	describe( 'Scenario C: Query matches a hit in searchQueryHits', () => {
		it( 'suggests the search hit label', () => {
			// Query = 'span', code = 'es', label = 'Español', hit label = 'Spanish'
			searchQuery.value = 'span';
			languagesToDisplay.value = [ 'es' ];
			languages.value = { es: 'Español' };
			searchQueryHits.value = { es: 'Spanish' };

			const { autocompleteSuggestion, getAcceptedSuggestion } = useTypeahead(
				searchQuery,
				languagesToDisplay,
				languages,
				searchQueryHits
			);

			expect( autocompleteSuggestion.value ).toBe( 'ish' );
			expect( getAcceptedSuggestion() ).toBe( 'Spanish' );
		} );
	} );

	it( 'returns empty suggestion when no match criteria are met', () => {
		searchQuery.value = 'xyz';
		languagesToDisplay.value = [ 'fr' ];
		languages.value = { fr: 'French' };

		const { autocompleteSuggestion, getAcceptedSuggestion } = useTypeahead(
			searchQuery,
			languagesToDisplay,
			languages,
			searchQueryHits
		);

		expect( autocompleteSuggestion.value ).toBe( '' );
		expect( getAcceptedSuggestion() ).toBeNull();
	} );
} );
