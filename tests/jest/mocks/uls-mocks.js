'use strict';

// Pure module mock for mediawiki.languageselector.core and .lookup: it must
// export only what the real modules export. Test helpers live in
// uls-test-helpers.js instead.

const { ref, computed, defineComponent } = require( 'vue' );

// Stub of the core useLanguageSelector composable, matching its return
// shape. Like the real composable, search() records the query and
// clearSearchQuery() resets state synchronously; only the network fetch is
// omitted — tests drive result state by writing to searchResults /
// searchQueryHits directly.
function useLanguageSelector( selectableLanguages, selected ) {
	const searchQuery = ref( '' );
	const searchQueryHits = ref( {} );
	const searchResults = ref( [] );
	const isSearching = ref( false );

	const resetSearch = () => {
		searchResults.value = [];
		searchQueryHits.value = {};
		isSearching.value = false;
	};

	return {
		clearSearchQuery: () => {
			resetSearch();
			searchQuery.value = '';
		},
		languages: computed( () => selectableLanguages.value || {} ),
		searchQuery,
		searchQueryHits,
		searchResults,
		selection: ref( [] ),
		selectedValues: computed( () => selected.value || [] ),
		search: ( query ) => {
			searchQuery.value = query;
			if ( !query || query.trim().length === 0 ) {
				resetSearch();
			}
		},
		isSearching,
		isSelectionUpdated: () => false
	};
}

const LanguageSelector = defineComponent( {
	name: 'LanguageSelector',
	template: '<div></div>'
} );

module.exports = {
	useLanguageSelector,
	LanguageSelector,
	getLookupLanguageSelector: jest.fn(),
	getMultiselectLookupLanguageSelector: jest.fn()
};
