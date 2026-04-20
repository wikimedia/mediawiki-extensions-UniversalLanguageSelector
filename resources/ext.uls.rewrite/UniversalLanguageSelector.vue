<template>
	<div
		v-show="visible"
		ref="menuRef"
		class="uls-rewrite"
		:style="floatingStyles"
		:class="[ densityClass, { 'uls-rewrite--mobile': isMobile, 'uls-rewrite--panel': currentView !== VIEW.MAIN } ]"
	>
		<div class="uls-rewrite__header">
			<template v-if="currentView === VIEW.MAIN">
				<div v-if="isMobile" class="uls-rewrite__header__mobile">
					<span>{{ $i18n( 'ext-uls-language-title' ) }}</span>
					<cdx-button
						weight="quiet"
						:aria-label="$i18n( 'ext-uls-close-button-label' ).text()"
						@click.stop="$emit( 'close' )">
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
						:placeholder="placeholder || $i18n( 'ext-uls-placeholder-search' ).text()"
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
			</template>
			<language-selector-panel-header
				v-else-if="currentView === VIEW.MISSING_CONTENT_LANGUAGES"
				:title="$i18n( 'ext-uls-missing-languages-panel-title' ).text()"
				:is-mobile="isMobile"
				@back="showLanguageSelector"
				@close="$emit( 'close' )"
			></language-selector-panel-header>
			<language-selector-panel-header
				v-else-if="currentView === VIEW.QUICK_ACTIONS"
				:title="$i18n( 'ext-uls-quick-actions-panel-title' ).text()"
				:is-mobile="isMobile"
				@back="showLanguageSelector"
				@close="$emit( 'close' )"
			></language-selector-panel-header>
		</div>
		<div ref="keyboardNavigationContainer" class="uls-rewrite__body">
			<template v-if="currentView === VIEW.MAIN">
				<missing-languages-entrypoint
					v-if="!isSearching && !searchQuery && missingLanguageEntrypoints.length !== 0"
					:entrypoints="missingLanguageEntrypoints"
					:languages="languages"
					:suggestions="userLanguageSuggestions"
					@click="showMissingLanguagesPanel"
				>
				</missing-languages-entrypoint>
				<!-- Search Results -->
				<language-list
					v-if="searchQuery && languagesToDisplay.length > 0"
					:language-codes="languagesToDisplay"
					:languages="languages"
					:lang="displayLanguageCode"
					:dir="displayLanguageDir"
					:highlighted-index="highlightedIndex"
					:selected-values-set="selectedValuesSet"
					:language-annotations="computedLanguageAnnotations"
					@select="select"
					@highlight="setHighlightedIndex"
				>
					<template #language-item="slotProps">
						<slot
							name="language-item"
							:item="slotProps.item"
							:annotations="slotProps.annotations"
						></slot>
					</template>
				</language-list>

				<!-- Suggested and All Languages -->
				<div v-else-if="!searchQuery && languagesToDisplay.length > 0">
					<div
						v-if="suggestedLanguagesToDisplay.length > 0"
						class="uls-rewrite__section uls-rewrite__section--suggested"
					>
						<h3 class="uls-rewrite__section-title">
							{{ $i18n( 'ext-uls-suggested-languages-title' ) }}
						</h3>
						<language-list
							:language-codes="suggestedLanguagesToDisplay"
							:languages="languages"
							:lang="displayLanguageCode"
							:dir="displayLanguageDir"
							:highlighted-index="highlightedIndex"
							:selected-values-set="selectedValuesSet"
							:language-annotations="computedLanguageAnnotations"
							@select="select"
							@highlight="setHighlightedIndex"
						>
							<template #language-item="slotProps">
								<slot
									name="language-item"
									:item="slotProps.item"
									:annotations="slotProps.annotations"
								></slot>
							</template>
						</language-list>
					</div>

					<div class="uls-rewrite__section uls-rewrite__section--all">
						<h3
							v-if="suggestedLanguagesToDisplay.length > 0"
							class="uls-rewrite__section-title"
						>
							{{ $i18n( 'ext-uls-all-languages-title' ) }}
						</h3>
						<language-list
							:language-codes="languagesToDisplay"
							:languages="languages"
							:lang="displayLanguageCode"
							:dir="displayLanguageDir"
							:highlighted-index="highlightedIndex"
							:index-offset="suggestedLanguagesToDisplay.length"
							:selected-values-set="selectedValuesSet"
							:language-annotations="computedLanguageAnnotations"
							@select="select"
							@highlight="setHighlightedIndex"
						>
							<template #language-item="slotProps">
								<slot
									name="language-item"
									:item="slotProps.item"
									:annotations="slotProps.annotations"
								></slot>
							</template>
						</language-list>
					</div>
				</div>

				<template v-if="languagesToDisplay.length === 0">
					<div v-if="searchQuery && !isSearching" class="uls-rewrite__no-results">
						<template v-if="hasSearchHits">
							<!-- Valid language was searched for, but no results were found -->
							<h3>{{ $i18n( 'ext-uls-unsupported-language-title' ) }}</h3>
							<empty-search-entrypoint
								v-if="emptySearchEntrypoints.length !== 0"
								:entrypoints="emptySearchEntrypoints"
								:languages="languages"
								:suggestions="suggestedLanguages"
								:search-query="searchQuery"
								:search-query-hits="searchQueryHits"
							></empty-search-entrypoint>
							<p v-else>
								{{ $i18n( 'ext-uls-unsupported-language-description' ) }}
							</p>
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
						<empty-list-entrypoint
							v-if="emptyLanguageListEntrypoints.length !== 0"
							:entrypoints="emptyLanguageListEntrypoints"
							:suggestions="userLanguageSuggestions"
							:languages="[]"
						></empty-list-entrypoint>
						<p v-else>
							{{ $i18n( 'ext-uls-no-languages-description' ) }}
						</p>
					</div>
				</template>
			</template>
			<missing-languages-panel
				v-else-if="currentView === VIEW.MISSING_CONTENT_LANGUAGES"
				:actions="missingLanguagesActions"
			></missing-languages-panel>
			<quick-actions-panel
				v-else-if="currentView === VIEW.QUICK_ACTIONS"
				:actions="quickActions"
			></quick-actions-panel>
		</div>
		<quick-action-trigger
			v-if="quickActionEntrypoints.length > 0 && currentView === VIEW.MAIN"
			:entrypoints="quickActionEntrypoints"
			:languages="languagesToDisplay"
			:suggestions="suggestedLanguagesToDisplay"
			:search-query="searchQuery"
			:search-query-hits="searchQueryHits"
			@trigger="showQuickActionsPanel"
		>
		</quick-action-trigger>
	</div>
</template>

<script>
const { defineComponent, toRefs, ref, computed, watch, nextTick, onMounted, onUnmounted } = require( 'vue' );
const { useLanguageSelector } = require( 'mediawiki.languageselector' );
const LanguageList = require( './LanguageList.vue' );
const QuickActionTrigger = require( './entrypoints/QuickActionTrigger.vue' );
const EmptyListEntrypoint = require( './entrypoints/EmptyListEntrypoint.vue' );
const EmptySearchEntrypoint = require( './entrypoints/EmptySearchEntrypoint.vue' );
const MissingLanguagesEntrypoint = require( './entrypoints/MissingLanguagesEntrypoint.vue' );
const MissingLanguagesPanel = require( './entrypoints/MissingLanguagesPanel.vue' );
const QuickActionsPanel = require( './entrypoints/QuickActionsPanel.vue' );
const LanguageSelectorPanelHeader = require( './LanguageSelectorPanelHeader.vue' );
const EntrypointRegistry = require( 'ext.uls.rewrite.entrypoints' );
const { ULS_MODE } = EntrypointRegistry;
const useKeyboardNavigation = require( './composables/useKeyboardNavigation.js' );
const useClickOutside = require( './composables/useClickOutside.js' );
const useTypeahead = require( './composables/useTypeahead.js' );
const useLanguageHistory = require( './composables/useLanguageHistory.js' );
const useSuggestedLanguages = require( './composables/useSuggestedLanguages.js' );
const useEntrypoints = require( './composables/useEntrypoints.js' );
const { useFloating, offset, flip, shift, autoUpdate } = require( './dist/floating-ui.js' );
const { CdxSearchInput, CdxButton, CdxIcon, CdxProgressBar } = require( '../codex.js' );
const { cdxIconClose } = require( '../icons.json' );
const languageData = require( '../language-data.json' ).languages;

const VIEW = Object.freeze( {
	MAIN: 'main',
	MISSING_CONTENT_LANGUAGES: 'missing-content-languages',
	QUICK_ACTIONS: 'quick-actions'
} );

module.exports = exports = defineComponent( {
	name: 'UniversalLanguageSelector',
	components: {
		CdxSearchInput,
		CdxButton,
		CdxIcon,
		CdxProgressBar,
		LanguageList,
		QuickActionTrigger,
		EmptyListEntrypoint,
		EmptySearchEntrypoint,
		MissingLanguagesEntrypoint,
		MissingLanguagesPanel,
		QuickActionsPanel,
		LanguageSelectorPanelHeader
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
		},
		displayLanguageCode: {
			type: String,
			default: ''
		},
		languageAnnotations: {
			type: Object,
			default: () => ( {} )
		},
		// ULS can be used in different contexts, which may require different sets of quick
		// actions and entrypoints. The mode prop allows the parent component to specify the
		// context in which ULS is being used, so that the appropriate entrypoints can be rendered.
		mode: {
			type: String,
			required: true,
			validator: ( value ) => Object.values( ULS_MODE ).includes( value )
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

		const currentView = ref( VIEW.MAIN );
		const quickActions = ref( [] );
		const missingLanguagesActions = ref( [] );

		const showMissingLanguagesPanel = ( actions ) => {
			missingLanguagesActions.value = actions;
			currentView.value = VIEW.MISSING_CONTENT_LANGUAGES;
		};

		const showQuickActionsPanel = ( actions ) => {
			quickActions.value = actions;
			currentView.value = VIEW.QUICK_ACTIONS;
		};

		const showLanguageSelector = () => {
			currentView.value = VIEW.MAIN;
		};

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

		const computedLanguageAnnotations = computed( () => {
			const annotations = {};
			for ( const code in languageData ) {
				annotations[ code ] = Object.assign(
					{},
					props.languageAnnotations[ code ],
					{ dir: languageData[ code ] }
				);
			}
			return annotations;
		} );

		const displayLanguageDir = computed( () => (
			props.displayLanguageCode ? languageData[ props.displayLanguageCode ] : null
		) );

		const scrollHighlightedIntoView = async () => {
			await nextTick();
			// eslint-disable-next-line no-use-before-define
			if ( !highlightedItem.value ) {
				return;
			}

			const languageItem = keyboardNavigationContainer.value
				// eslint-disable-next-line no-use-before-define
				.querySelectorAll( `.uls-rewrite__language-item[data-language-code="${ highlightedItem.value }"]` )[ 0 ];
			if ( languageItem ) {
				languageItem.scrollIntoView( { block: 'nearest' } );
			}
		};

		const { addLanguageToHistory, previousLanguages } = useLanguageHistory();
		const { getSuggestedLanguages } = useSuggestedLanguages();

		// Language suggestions present in the language selector
		const availableLanguageSuggestions = getSuggestedLanguages( previousLanguages, languageCodes );

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

			return availableLanguageSuggestions.value.slice( 0, SUGGESTED_LANGUAGES_COUNT );
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
				currentView.value = VIEW.MAIN;
				clearSearchQuery();
			}
		}, { immediate: true } );

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

		const {
			quickActionEntrypoints,
			emptyLanguageListEntrypoints,
			emptySearchEntrypoints,
			missingLanguageEntrypoints
		} = useEntrypoints( props.mode );

		// Language suggestions for the user, irrespective of what's available in the selector
		const userLanguageSuggestions = getSuggestedLanguages( previousLanguages );

		onMounted( async () => {
			window.addEventListener( 'resize', updateViewportWidth );
		} );

		onUnmounted( () => {
			window.removeEventListener( 'resize', updateViewportWidth );
		} );

		return {
			// Template Refs
			menuRef,
			searchInputRef,
			keyboardNavigationContainer,

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
			computedLanguageAnnotations,
			displayLanguageDir,

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
			quickActionEntrypoints,
			quickActions,
			missingLanguagesActions,
			emptyLanguageListEntrypoints,
			userLanguageSuggestions,
			emptySearchEntrypoints,
			missingLanguageEntrypoints,

			// View management
			VIEW,
			currentView,
			showMissingLanguagesPanel,
			showQuickActionsPanel,
			showLanguageSelector
		};
	}
} );
</script>
