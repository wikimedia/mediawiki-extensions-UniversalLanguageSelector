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
					@keydown.tab="onKeyTab"
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
			<!-- Search Results -->
			<ul
				v-if="searchQuery && languagesToDisplay.length > 0"
				class="uls-rewrite__body__language-list"
				role="listbox"
			>
				<language-item
					v-for="( languageCode, index ) in languagesToDisplay"
					:key="languageCode"
					:ref="( el ) => setItemRef( el, languageCode )"
					:code="languageCode"
					:name="languages[languageCode]"
					:is-highlighted="highlightedIndex === index"
					:is-selected="selectedValuesSet.has( languageCode )"
					@select="select"
					@mousemove="setHighlightedIndex( index )"
				>
					<template #default="slotProps">
						<slot name="language-item" :item="slotProps.item"></slot>
					</template>
				</language-item>
			</ul>

			<!-- Suggested and All Languages -->
			<div v-else-if="!searchQuery && languagesToDisplay.length > 0">
				<div
					v-if="suggestedLanguagesToDisplay.length > 0"
					class="uls-rewrite__section uls-rewrite__section--suggested"
				>
					<h3 class="uls-rewrite__section-title">
						{{ $i18n( 'ext-uls-suggested-languages-title' ) }}
					</h3>
					<ul class="uls-rewrite__body__language-list" role="listbox">
						<language-item
							v-for="( languageCode, index ) in suggestedLanguagesToDisplay"
							:key="languageCode"
							:ref="( el ) => setItemRef( el, languageCode )"
							:code="languageCode"
							:name="languages[languageCode]"
							:is-highlighted="highlightedIndex === index"
							:is-selected="selectedValuesSet.has( languageCode )"
							@select="select"
							@mousemove="setHighlightedIndex( index )"
						>
							<template #default="slotProps">
								<slot name="language-item" :item="slotProps.item"></slot>
							</template>
						</language-item>
					</ul>
				</div>

				<div class="uls-rewrite__section uls-rewrite__section--all">
					<h3
						v-if="suggestedLanguagesToDisplay.length > 0"
						class="uls-rewrite__section-title"
					>
						{{ $i18n( 'ext-uls-all-languages-title' ) }}
					</h3>
					<ul class="uls-rewrite__body__language-list" role="listbox">
						<language-item
							v-for="( languageCode, index ) in languagesToDisplay"
							:key="languageCode"
							:ref="( el ) => setItemRef( el, languageCode )"
							:code="languageCode"
							:name="languages[languageCode]"
							:is-highlighted="highlightedIndex === ( index + suggestedLanguagesToDisplay.length )"
							:is-selected="selectedValuesSet.has( languageCode )"
							@select="select"
							@mousemove="setHighlightedIndex( index + suggestedLanguagesToDisplay.length )"
						>
							<template #default="slotProps">
								<slot name="language-item" :item="slotProps.item"></slot>
							</template>
						</language-item>
					</ul>
				</div>
			</div>

			<template v-if="languagesToDisplay.length === 0">
				<div v-if="searchQuery && !isSearching" class="uls-rewrite__no-results">
					<template v-if="hasSearchHits">
						<!-- Valid language was searched for, but no results were found -->
						<h3>{{ $i18n( 'ext-uls-unsupported-language-title' ) }}</h3>
						<p>{{ $i18n( 'ext-uls-unsupported-language-description' ) }}</p>
					</template>
					<template v-else>
						<!-- No valid search query was entered -->
						<h3>{{ $i18n( 'ext-uls-invalid-language-search-title' ) }}</h3>
						<p>{{ $i18n( 'ext-uls-invalid-language-search-description' ) }}</p>
					</template>
				</div>
				<div v-else-if="!isSearching" class="uls-rewrite__no-languages">
					<!-- No language items -->
					<h3>{{ $i18n( 'ext-uls-no-languages-title' ) }}</h3>
					<template v-if="emptyLanguageListActions && emptyLanguageListActions.length !== 0">
						<empty-list-entrypoint
							:empty-list-actions="emptyLanguageListActions"
							:suggestions="possibleSuggestedLanguages"
							:languages="[]"
						></empty-list-entrypoint>
					</template>
					<p v-else>
						{{ $i18n( 'ext-uls-no-languages-description' ) }}
					</p>
				</div>
			</template>
		</div>
		<quick-action-trigger
			v-if="quickActions && quickActions.length > 0"
			:quick-actions="quickActions"
			:languages="languagesToDisplay"
			:suggestions="suggestedLanguagesToDisplay"
			:search-query="searchQuery"
			:search-query-hits="searchQueryHits"
		>
		</quick-action-trigger>
	</div>
</template>

<script>
const { defineComponent, toRefs, ref, computed, watch, nextTick, onBeforeUpdate, onMounted, onUnmounted } = require( 'vue' );
const { useLanguageSelector } = require( 'mediawiki.languageselector' );
const LanguageItem = require( './LanguageItem.vue' );
const QuickActionTrigger = require( './entrypoints/QuickActionTrigger.vue' );
const EmptyListEntrypoint = require( './entrypoints/EmptyListEntrypoint.vue' );
const useKeyboardNavigation = require( './composables/useKeyboardNavigation.js' );
const useClickOutside = require( './composables/useClickOutside.js' );
const useTypeahead = require( './composables/useTypeahead.js' );
const useLanguageHistory = require( './composables/useLanguageHistory.js' );
const useSuggestedLanguages = require( './composables/useSuggestedLanguages.js' );
const { useFloating, offset, flip, shift, autoUpdate } = require( './dist/floating-ui.js' );
const { CdxSearchInput, CdxButton, CdxIcon, CdxProgressBar } = require( '../codex.js' );
const { cdxIconClose } = require( '../icons.json' );
const EntrypointRegistry = require( 'ext.uls.rewrite.entrypoints' );

module.exports = exports = defineComponent( {
	name: 'UniversalLanguageSelector',
	components: {
		CdxSearchInput,
		CdxButton,
		CdxIcon,
		CdxProgressBar,
		LanguageItem,
		QuickActionTrigger,
		EmptyListEntrypoint
	},
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
		},
		hideSuggestedLanguages: {
			type: Boolean,
			default: false
		},
		suggestedLanguages: {
			type: Array,
			default: null
		}
	},
	emits: [ 'close', 'select' ],
	setup( props, { emit } ) {
		const DEBOUNCE_DELAY_MS = 300;
		const DENSITY_LOW_THRESHOLD = 10;
		const DENSITY_MEDIUM_THRESHOLD = 30;
		const SUGGESTED_LANGUAGES_COUNT = 6;
		const MOBILE_WIDTH_THRESHOLD = 768;
		const RESIZE_DEBOUNCE_DELAY_MS = 100;

		const { selectableLanguages, selected, triggerElement, visible } = toRefs( props );

		const menuRef = ref( null );
		const searchInputRef = ref( null );
		const keyboardNavigationContainer = ref( null );
		const itemRefs = ref( new Map() );

		const viewportWidth = ref( window.innerWidth );
		const isMobile = computed( () => viewportWidth.value < MOBILE_WIDTH_THRESHOLD );

		const {
			languages,
			search,
			searchQuery,
			searchQueryHits,
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

		const selectedValuesSet = computed( () => new Set( selectedValues.value ) );

		const floatingStyles = isMobile.value ?
			ref( {} ) :
			useFloating( triggerElement, menuRef, {
				placement: 'bottom-end',
				middleware: [ offset( 8 ), flip(), shift() ],
				whileElementsMounted: autoUpdate
			} ).floatingStyles;

		const languagesToDisplay =
			computed( () => ( searchQuery.value && searchQuery.value.trim().length > 0 ) ?
				searchResults.value : Object.keys( languages.value )
			);

		const hasSearchHits = computed( () => Object.keys( searchQueryHits.value ).length > 0 );

		const languageCodes = computed( () => Object.keys( languages.value ) );

		const densityClass = computed( () => {
			const count = languageCodes.value.length;
			if ( count < DENSITY_LOW_THRESHOLD ) {
				return 'uls-rewrite--density-low';
			}
			if ( count < DENSITY_MEDIUM_THRESHOLD ) {
				return 'uls-rewrite--density-medium';
			}
			return 'uls-rewrite--density-high';
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

		const { addLanguageToHistory, previousLanguages } = useLanguageHistory();
		const { getSuggestedLanguages } = useSuggestedLanguages();

		const defaultSuggestedLanguages =
			computed( () => getSuggestedLanguages( previousLanguages, languageCodes ).value );

		const suggestedLanguagesToDisplay = computed( () => {
			if ( props.hideSuggestedLanguages || searchQuery.value ) {
				return [];
			}

			if ( props.suggestedLanguages ) {
				return props.suggestedLanguages.slice( 0, SUGGESTED_LANGUAGES_COUNT );
			}

			if ( languageCodes.value.length < DENSITY_LOW_THRESHOLD ) {
				return [];
			}

			return defaultSuggestedLanguages.value.slice( 0, SUGGESTED_LANGUAGES_COUNT );
		} );

		const combinedLanguages =
			computed( () => [ ...suggestedLanguagesToDisplay.value, ...languagesToDisplay.value ] );

		const {
			next,
			prev,
			highlightedItem,
			highlightedIndex,
			setHighlightedItem,
			highlightFirst,
			clearHighlightedItem
		} = useKeyboardNavigation( combinedLanguages, visible, scrollHighlightedIntoView );

		useClickOutside( menuRef, visible, document, () => emit( 'close' ) );

		const { autocompleteSuggestion, getAcceptedSuggestion } =
			useTypeahead( searchQuery, languagesToDisplay, languages, searchQueryHits );

		const setItemRef = ( el, code ) => {
			if ( el ) {
				itemRefs.value.set( code, el.$el || el );
			}
		};

		onBeforeUpdate( () => {
			itemRefs.value.clear();
		} );

		const select = ( languageCode, languageValue ) => {
			setHighlightedItem( languageCode );
			addLanguageToHistory( languageCode );
			emit( 'select', { code: languageCode, value: languageValue } );
		};

		const onEnter = () => {
			if ( highlightedItem.value ) {
				select( highlightedItem.value, languages.value[ highlightedItem.value ] );
				return;
			}

			if ( autocompleteSuggestion.value && combinedLanguages.value.length > 0 ) {
				const firstItemCode = combinedLanguages.value[ 0 ];
				select( firstItemCode, languages.value[ firstItemCode ] );
				return;
			}

			if ( searchQuery.value && languages.value[ searchQuery.value ] ) {
				select( searchQuery.value, languages.value[ searchQuery.value ] );
				return;
			}

			if ( searchResults.value.length === 1 ) {
				const code = searchResults.value[ 0 ];
				select( code, languages.value[ code ] );
			}
		};

		const setHighlightedIndex = ( index ) => {
			highlightedIndex.value = index;
		};

		const onKeyTab = ( e ) => {
			const suggestion = getAcceptedSuggestion();
			if ( suggestion ) {
				e.preventDefault();
				searchQuery.value = suggestion;
			}
		};

		const onKeyRight = ( e ) => {
			const input = e.target;
			// Only autocomplete if the cursor is at the end of the current text
			if (
				autocompleteSuggestion.value &&
				input.selectionStart === searchQuery.value.length
			) {
				const suggestion = getAcceptedSuggestion();
				if ( suggestion ) {
					e.preventDefault();
					searchQuery.value = suggestion;
				}
			}
		};

		const focusInput = async () => {
			await nextTick();
			if ( searchInputRef.value ) {
				searchInputRef.value.focus();
			}
		};

		watch( visible, async ( isVisible ) => {
			if ( isVisible ) {
				await focusInput();
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

		const debounce = ( fn, delay ) => {
			let timeoutId;
			return ( ...args ) => {
				clearTimeout( timeoutId );
				timeoutId = setTimeout( () => fn( ...args ), delay );
			};
		};

		const updateViewportWidth = debounce( () => {
			viewportWidth.value = window.innerWidth;
		}, RESIZE_DEBOUNCE_DELAY_MS );

		const possibleSuggestedLanguages = getSuggestedLanguages( previousLanguages );
		const quickActions = EntrypointRegistry.getRegisteredEntrypoints( 'quick-actions' );
		const emptyLanguageListActions = EntrypointRegistry.getRegisteredEntrypoints( 'empty-list' );

		onMounted( async () => {
			window.addEventListener( 'resize', updateViewportWidth );

			await nextTick();
			// Lock the registry to ensure that further entrypoints cannot be added.
			// Trying to add entrypoints now will cause errors to be thrown.
			EntrypointRegistry.lock();
		} );

		onUnmounted( () => {
			window.removeEventListener( 'resize', updateViewportWidth );
		} );

		return {
			// Template Refs
			menuRef,
			searchInputRef,
			keyboardNavigationContainer,
			setItemRef,

			// Search & Data Source
			languages,
			suggestedLanguagesToDisplay,
			languagesToDisplay,
			searchQuery,
			hasSearchHits,
			search,
			isSearching,
			autocompleteSuggestion,
			selectedValuesSet,
			searchQueryHits,

			// Appearance & Layout
			floatingStyles,
			densityClass,
			isMobile,

			// Keyboard Navigation
			highlightedIndex,
			next,
			prev,
			onEnter,
			onKeyTab,
			onKeyRight,
			setHighlightedIndex,

			// General Actions
			select,

			// Assets
			cdxIconClose,

			// Entrypoints
			quickActions,
			emptyLanguageListActions,
			possibleSuggestedLanguages
		};
	}
} );
</script>
