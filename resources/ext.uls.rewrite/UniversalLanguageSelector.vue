<template>
	<div
		v-show="visible"
		ref="menuRef"
		class="uls-rewrite"
		:style="floatingStyles"
		:class="[ densityClass, { 'uls-rewrite--mobile': isMobile } ]"
	>
		<div class="uls-rewrite__header">
			<div v-if="isMobile" class="uls-rewrite__header__mobile">
				<span>{{ $i18n( 'ext-uls-language-title' ) }}</span>
				<cdx-button
					weight="quiet"
					:aria-label="$i18n( 'ext-uls-close-button-label' )"
					@click="$emit( 'close' )">
					<cdx-icon :icon="cdxIconClose"></cdx-icon>
				</cdx-button>
			</div>
			<div class="uls-rewrite__search-wrapper">
				<cdx-search-input
					v-if="autocompleteSuggestion"
					class="uls-rewrite__search-ghost"
					:model-value="searchQuery + autocompleteSuggestion"
					disabled
					tabindex="-1"
					aria-hidden="true"
				></cdx-search-input>
				<cdx-search-input
					ref="searchInputRef"
					class="uls-rewrite__search-active"
					:model-value="searchQuery"
					:placeholder="placeholder || $i18n( 'ext-uls-placeholder-search' )"
					@update:model-value="search"
					@keydown.down.stop.prevent="next"
					@keydown.up.stop.prevent="prev"
					@keydown.enter.stop.prevent="onEnter"
					@keydown.esc.prevent="$emit( 'close' )"
					@keydown.tab.prevent="onKeyTab"
					@keydown.right="onKeyRight"
				></cdx-search-input>
			</div>
			<cdx-progress-bar
				v-if="isSearching"
				inline
				class="uls-rewrite__progress"
			></cdx-progress-bar>
		</div>
		<div ref="keyboardNavigationContainer" class="uls-rewrite__body">
			<ul
				v-if="languagesToDisplay.length > 0"
				class="uls-rewrite__body__language-list"
				role="listbox"
			>
				<li
					v-for="languageCode in languagesToDisplay"
					:key="languageCode"
					:lang="languageCode"
					class="uls-rewrite__language-item"
					:class="{
						'uls-rewrite__language-item--highlighted': highlightedItem === languageCode,
						'uls-rewrite__language-item--selected':
							selectedValues.includes( languageCode )
					}"
					:aria-selected="selectedValues.includes( languageCode )"
					role="option"
					@click="select( languageCode, languages[languageCode] )"
					@mousemove="setHighlightedItem( languageCode )"
				>
					<slot name="language-item" :item="languages[languageCode]">
						{{ languages[languageCode] }}
					</slot>
				</li>
			</ul>

			<div
				v-if="languagesToDisplay.length === 0 && searchQuery && !isSearching"
				class="uls-rewrite__no-results"
			>
				{{ $i18n( 'ext-uls-compact-no-results' ) }}
			</div>
		</div>
	</div>
</template>

<script>
const { defineComponent, toRefs, ref, computed, watch, nextTick, onMounted } = require( 'vue' );
const { useLanguageSelector } = require( 'mediawiki.languageselector' );
const useKeyboardNavigation = require( './useKeyboardNavigation.js' );
const useClickOutside = require( './useClickOutside.js' );
const useTypeahead = require( './useTypeahead.js' );
const { useFloating, offset, flip, shift, autoUpdate } = require( './dist/floating-ui.js' );
const { CdxSearchInput, CdxButton, CdxIcon, CdxProgressBar } = require( '../codex.js' );
const { cdxIconClose } = require( '../icons.json' );

module.exports = exports = defineComponent( {
	name: 'UniversalLanguageSelector',
	components: { CdxSearchInput, CdxButton, CdxIcon, CdxProgressBar },
	props: {
		// eslint-disable-next-line vue/no-unused-properties
		triggerElement: {
			type: Object,
			required: true
		},
		visible: {
			type: Boolean,
			default: false
		},
		// eslint-disable-next-line vue/no-unused-properties
		selectableLanguages: {
			type: Object,
			default: () => null
		},
		searchApiUrl: {
			type: String,
			default: () => null
		},
		// eslint-disable-next-line vue/no-unused-properties
		selected: {
			type: Array,
			default: () => []
		},
		placeholder: {
			type: String,
			default: null
		}
	},
	emits: [ 'close', 'select' ],
	setup( props, { emit } ) {
		const DEBOUNCE_DELAY_MS = 300;
		const DENSITY_LOW_THRESHOLD = 10;
		const DENSITY_MEDIUM_THRESHOLD = 30;

		const { selectableLanguages, selected, triggerElement, visible } = toRefs( props );

		const menuRef = ref( null );
		const searchInputRef = ref( null );
		const keyboardNavigationContainer = ref( null );
		const isMobile = !!mw.config.get( 'wgMFMode' );

		const {
			languages,
			search,
			searchQuery,
			searchResults,
			clearSearchQuery,
			isSearching,
			selectedValues
		} = useLanguageSelector(
			selectableLanguages,
			selected,
			props.searchApiUrl,
			DEBOUNCE_DELAY_MS,
			true
		);

		const { floatingStyles: rawFloatingStyles } = useFloating( triggerElement, menuRef, {
			placement: 'bottom-end',
			middleware: [
				// Add some spacing between trigger and menu
				offset( 8 ),
				flip(),
				shift()
			],
			whileElementsMounted: isMobile ? undefined : autoUpdate
		} );

		const floatingStyles = computed( () => {
			if ( isMobile ) {
				return {};
			}

			return rawFloatingStyles.value;
		} );

		const languagesToDisplay =
			computed( () => ( searchQuery.value && searchQuery.value.trim().length > 0 ) ?
				searchResults.value : Object.keys( languages.value ) );

		const densityClass = computed( () => {
			const languageKeys = Object.keys( languages.value );
			if ( languageKeys.length < DENSITY_LOW_THRESHOLD ) {
				return 'uls-rewrite--density-low';
			} else if ( languageKeys.length < DENSITY_MEDIUM_THRESHOLD ) {
				return 'uls-rewrite--density-medium';
			} else {
				return 'uls-rewrite--density-high';
			}
		} );

		const scrollHighlightedIntoView = async () => {
			await nextTick();
			// eslint-disable-next-line no-use-before-define
			if ( !highlightedItem.value ) {
				return;
			}

			const languageItem = keyboardNavigationContainer.value
				// eslint-disable-next-line no-use-before-define
				.querySelectorAll( `.uls-rewrite__language-item[lang="${ highlightedItem.value }"]` )[ 0 ];
			if ( languageItem ) {
				languageItem.scrollIntoView( { block: 'nearest' } );
			}
		};

		const {
			next,
			prev,
			highlightedItem,
			setHighlightedItem,
			highlightFirst,
			clearHighlightedItem
		} = useKeyboardNavigation( languagesToDisplay, visible, scrollHighlightedIntoView );

		useClickOutside( menuRef, visible, document, () => emit( 'close' ) );

		const select = ( languageCode, languageValue ) => {
			setHighlightedItem( languageCode );
			emit( 'select', { code: languageCode, value: languageValue } );
		};

		const { autocompleteSuggestion, getAcceptedSuggestion } =
			useTypeahead( searchQuery, languagesToDisplay, languages );

		const onEnter = () => {
			if ( autocompleteSuggestion.value || ( highlightedItem.value ) ) {
				const code = highlightedItem.value || languagesToDisplay.value[ 0 ];
				select( code, languages.value[ code ] );
				return;
			}

			// If the search value is a known language, select it
			if ( searchQuery.value && languagesToDisplay.value.includes( searchQuery.value ) ) {
				select( searchQuery.value, languages.value[ searchQuery.value ] );
				return;
			}

			// If there is only one search result, select it
			if ( searchResults.value.length === 1 ) {
				select( searchResults.value[ 0 ], languages.value[ searchResults.value[ 0 ] ] );
				return;
			}
		};

		const onKeyTab = () => {
			const suggestion = getAcceptedSuggestion();
			if ( suggestion ) {
				searchQuery.value = suggestion;
			}
		};

		const onKeyRight = ( e ) => {
			const input = e.target;
			// Only autocomplete if the cursor is at the end of the current text
			if ( autocompleteSuggestion.value && input.selectionStart === searchQuery.value.length ) {
				const suggestion = getAcceptedSuggestion();
				if ( suggestion ) {
					searchQuery.value = suggestion;
				}
			}
		};

		onMounted( async () => {
			if ( visible.value ) {
				await nextTick();
				searchInputRef.value.focus();
			}
		} );

		watch( visible, async ( isVisible ) => {
			if ( isVisible ) {
				await nextTick();
				searchInputRef.value.focus();
			} else {
				clearSearchQuery();
			}
		} );

		watch( languagesToDisplay, ( newLanguages ) => {
			if ( newLanguages.length === 0 ) {
				clearHighlightedItem();
				return;
			}

			// If searching, auto-select the first item.
			if ( searchQuery.value ) {
				highlightFirst();
			} else {
				clearHighlightedItem();
			}
		}, { immediate: true } );

		return {
			// Template Refs
			menuRef,
			searchInputRef,
			keyboardNavigationContainer,

			// Search & Data Source
			languages,
			languagesToDisplay,
			searchQuery,
			search,
			isSearching,
			autocompleteSuggestion,
			selectedValues,

			// Appearance & Layout
			floatingStyles,
			densityClass,
			isMobile,

			// Keyboard Navigation
			highlightedItem,
			next,
			prev,
			onEnter,
			onKeyTab,
			onKeyRight,
			setHighlightedItem,

			// General Actions
			select,

			// Assets
			cdxIconClose
		};
	}
} );
</script>
