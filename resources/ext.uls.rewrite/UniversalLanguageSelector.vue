<template>
	<div
		v-show="visible"
		ref="menuRef"
		class="uls-rewrite"
		role="dialog"
		:aria-modal="isMobile ? 'true' : 'false'"
		:aria-label="dialogAriaLabel"
		:style="isMobile ? null : floatingStyles"
		:class="[
			densityClass,
			{ 'uls-rewrite--mobile': isMobile, 'uls-rewrite--panel': currentView !== VIEW.MAIN }
		]"
		@mouseleave="clearHighlightedItem"
		@keydown.esc.prevent.stop="$emit( 'close' )"
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
						role="combobox"
						aria-autocomplete="list"
						:aria-expanded="hasDisplayableContent"
						:aria-controls="listboxIds"
						:aria-activedescendant="activeOptionId"
						:model-value="searchQuery"
						:placeholder="placeholder || $i18n( 'ext-uls-placeholder-search' ).text()"
						@update:model-value="search"
						@keydown.down.stop.prevent="next"
						@keydown.up.stop.prevent="prev"
						@keydown.enter.stop.prevent="onEnter"
						@keydown.tab="onKeyTab"
						@keydown.right="onKeyRight"
					></cdx-search-input>
				</div>
				<cdx-progress-bar
					v-if="isSearching"
					inline
					class="uls-rewrite__progress"
				></cdx-progress-bar>
				<!-- Screen-reader-only announcement of the search result count. -->
				<div
					class="uls-rewrite__sr-only"
					role="status"
					aria-live="polite"
				>
					{{ searchStatus }}
				</div>
			</template>
			<language-selector-panel-header
				v-else
				ref="panelHeaderRef"
				:title="panelTitle"
				:is-mobile="isMobile"
				@back="showLanguageSelector"
				@close="$emit( 'close' )"
			></language-selector-panel-header>
		</div>
		<div
			ref="keyboardNavigationContainer"
			class="uls-rewrite__body"
		>
			<template v-if="currentView === VIEW.MAIN">
				<missing-languages-entrypoint
					v-if="!isSearching && !searchQuery && missingLanguageEntrypoints.length !== 0"
					:entrypoints="missingLanguageEntrypoints"
					:languages="languages"
					:suggestions="userLanguageSuggestions"
					:preferred-languages="preferredLanguages"
					@click="showMissingLanguagesPanel"
				>
				</missing-languages-entrypoint>

				<!-- Search results, variants, suggested and all languages. During
				search, mainSections collapses to a single "all" section holding the
				search results, so this one render path covers both cases. -->
				<div v-if="hasDisplayableContent">
					<div
						v-for="section in mainSections"
						:key="section.key"
						class="uls-rewrite__section"
						:class="section.modifierClass"
					>
						<h3
							v-if="section.title"
							class="uls-rewrite__section-title"
						>
							{{ section.title }}
						</h3>
						<language-list
							:language-codes="section.codes"
							:languages="section.languages"
							:lang="displayLanguageCode"
							:dir="displayLanguageDir"
							:highlighted-index="highlightedIndex"
							:index-offset="section.indexOffset"
							:selected-values-set="selectedValuesSet"
							:unavailable-languages-set="unavailableLanguagesSet"
							:language-annotations="section.annotations"
							:id-prefix="baseId"
							:listbox-id="sectionListboxId( section.key )"
							:listbox-label="section.title || listboxFallbackLabel"
							@select="select"
							@highlight="setHighlightedIndex"
							@mouseleave="clearHighlightedItem"
						>
							<!--
							mouseleave on the list, not the item: a per-item mouseleave would
							fire during keyboard nav when the list scrolls items under a
							stationary cursor, fighting the keyboard highlight. The list's
							inline-end margin makes the clearance strip clear the highlight too.
						-->
							<template #language-item="slotProps">
								<slot
									name="language-item"
									:item="slotProps.item"
									:annotations="slotProps.annotations"
									:is-available="slotProps.isAvailable"
								></slot>
							</template>
						</language-list>
						<!-- Reserve height for rows not yet progressively rendered so
						the scrollbar stays stable while the list fills in. -->
						<div
							v-if="section.reservedHeight > 0"
							class="uls-rewrite__list-reserve"
							:style="{ height: section.reservedHeight + 'px' }"
							aria-hidden="true"
						></div>
					</div>
				</div>

				<template v-else>
					<div v-if="searchQuery && !isSearching" class="uls-rewrite__no-results">
						<template v-if="hasSearchHits">
							<!-- Valid language was searched for, but no results were found -->
							<h3>{{ $i18n( 'ext-uls-unsupported-language-title' ) }}</h3>
							<empty-search-entrypoint
								v-if="emptySearchEntrypoints.length !== 0"
								:entrypoints="emptySearchEntrypoints"
								:languages="languages"
								:suggestions="userLanguageSuggestions"
								:preferred-languages="preferredLanguages"
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
							:preferred-languages="preferredLanguages"
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
			v-if="quickActionEntrypoints.length > 0 && currentView === VIEW.MAIN && hasDisplayableContent && !searchQuery"
			:entrypoints="quickActionEntrypoints"
			:languages="languagesToDisplay"
			:suggestions="userLanguageSuggestions"
			:preferred-languages="preferredLanguages"
			:search-query="searchQuery"
			:search-query-hits="searchQueryHits"
			@trigger="showQuickActionsPanel"
		>
		</quick-action-trigger>
	</div>
</template>

<script>
const { defineComponent, toRefs, ref, computed, watch, nextTick, onMounted, onUnmounted, useId } = require( 'vue' );
const { useLanguageSelector } = require( 'mediawiki.languageselector.core' );
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
const useFocusTrap = require( './composables/useFocusTrap.js' );
const useTypeahead = require( './composables/useTypeahead.js' );
const useLanguageHistory = require( './composables/useLanguageHistory.js' );
const useSuggestedLanguages = require( './composables/useSuggestedLanguages.js' );
const usePreferredLanguages = require( './composables/usePreferredLanguages.js' );
const useEntrypoints = require( './composables/useEntrypoints.js' );
const useProgressiveRender = require( './composables/useProgressiveRender.js' );
const { useFloating, offset, flip, shift, autoUpdate } = require( './dist/floating-ui.js' );
const { CdxSearchInput, CdxButton, CdxIcon, CdxProgressBar } = require( '../codex.js' );
const { cdxIconClose } = require( '../icons.json' );
const languageData = require( '../language-data.json' );
const rtlLanguages = new Set( languageData.rtlLanguages );

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
		hideActiveLanguages: {
			type: Boolean,
			default: false
		},
		displayLanguageCode: {
			type: String,
			default: ''
		},
		languageAnnotations: {
			type: Object,
			default: () => ( {} )
		},
		// Map of base language code -> { variantCode: value }. When the user clicks a
		// language that has an entry here, the click does not navigate; instead the
		// "Variants" section at the top of the selector renders those variants for
		// the user to pick from. Clicking the same base language a second time falls
		// through to a normal navigation (to the default variant).
		variantsByLanguage: {
			type: Object,
			default: () => ( {} )
		},
		variantAnnotationsByLanguage: {
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
		},
		floatingOptions: {
			type: Object,
			default: () => ( {
				placement: 'bottom-end'
			} )
		}
	},
	emits: [ 'close', 'select', 'visible-change' ],
	setup( props, { emit } ) {
		const DEBOUNCE_DELAY_MS = 300;
		const DENSITY_LOW_THRESHOLD = 10;
		const DENSITY_MEDIUM_THRESHOLD = 30;
		const SUGGESTED_LANGUAGES_COUNT = 6;
		const PREFERRED_LANGUAGES_COUNT = 10;
		const MOBILE_WIDTH_THRESHOLD = 768;

		const { selectableLanguages, selected, triggerElement, visible } = toRefs( props );

		const menuRef = ref( null );
		const searchInputRef = ref( null );
		const keyboardNavigationContainer = ref( null );
		const panelHeaderRef = ref( null );

		// Stable id base for the combobox/listbox ARIA wiring.
		const baseId = useId();
		// Per-section listbox id; the input's aria-controls lists these.
		const sectionListboxId = ( key ) => `${ baseId }-listbox-${ key }`;
		// Fallback listbox name for a section with no visible heading.
		const listboxFallbackLabel = mw.msg( 'ext-uls-language-title' );

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

		const mobileMediaQuery = window.matchMedia(
			`(max-width: ${ MOBILE_WIDTH_THRESHOLD - 1 }px)`
		);
		const isMobile = ref( mobileMediaQuery.matches );
		const toggleBodyScrollLock = ( isLocked ) => {
			// Lock <html> too; the top-level scrollbar lives there, not on <body>.
			document.documentElement.classList.toggle( 'uls-rewrite-no-scroll', isLocked );
			document.body.classList.toggle( 'uls-rewrite-no-scroll', isLocked );
		};

		const onBreakpointChange = ( event ) => {
			isMobile.value = event.matches;
		};

		// Panel title for the non-main views. Empty for the main view, which has
		// no panel header.
		const panelTitle = computed( () => {
			switch ( currentView.value ) {
				case VIEW.MISSING_CONTENT_LANGUAGES:
					return mw.msg( 'ext-uls-missing-languages-panel-title' );
				case VIEW.QUICK_ACTIONS:
					return mw.msg( 'ext-uls-quick-actions-panel-title' );
				default:
					return '';
			}
		} );

		// The dialog's aria-label mirrors the panel title, falling back to the
		// language-selector title on the main view.
		const dialogAriaLabel = computed(
			() => panelTitle.value || mw.msg( 'ext-uls-language-title' )
		);

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

		// The "Variants" section always reflects the currently selected language
		// (typically the page's content language). After the user picks a different
		// language, the selector closes and the page navigates; on the next page,
		// `selected` will reflect that new language and the variants for it will be
		// shown when the selector is reopened.
		const variantLanguageCode = computed( () => {
			const current = selected.value;
			if ( Array.isArray( current ) ) {
				return current[ 0 ] || null;
			}
			return current || null;
		} );

		const currentVariants = computed( () => {
			const code = variantLanguageCode.value;
			if ( !code ) {
				return {};
			}
			return props.variantsByLanguage[ code ] || {};
		} );

		const currentVariantAnnotations = computed( () => {
			const code = variantLanguageCode.value;
			if ( !code ) {
				return {};
			}
			return props.variantAnnotationsByLanguage[ code ] || {};
		} );

		const currentVariantCodes = computed( () => Object.keys( currentVariants.value ) );

		const variantsTitle = computed( () => {
			const code = variantLanguageCode.value;
			if ( !code ) {
				return '';
			}
			const autonym = $.uls.data.getAutonym( code ) || code;
			return mw.msg( 'ext-uls-variants-title', autonym );
		} );

		const { floatingStyles, isPositioned } = useFloating(
			triggerElement,
			menuRef,
			Object.assign( {
				middleware: [ offset( 8 ), flip(), shift() ],
				whileElementsMounted: autoUpdate
			}, props.floatingOptions )
		);

		/**
		 * Get the display name for a language code.
		 *
		 * @param {string} code
		 * @return {string}
		 */
		const getLanguageName = ( code ) => {
			const val = languages.value[ code ];
			if ( !val ) {
				return $.uls.data.getAutonym( code ) || code;
			}
			if ( typeof val === 'string' ) {
				return val;
			}
			return val.text || $.uls.data.getAutonym( code ) || code;
		};

		const sortedAllCodes = computed( () => {
			let collator;
			try {
				collator = new Intl.Collator( props.displayLanguageCode || undefined );
			} catch ( e ) {
				// Fallback to default locale if displayLanguageCode is not a valid BCP 47 tag.
				// MediaWiki language codes such as 'simple' or 'test' are not always valid.
				collator = new Intl.Collator();
			}

			return Object.keys( languages.value )
				.map( ( code ) => ( {
					code,
					name: getLanguageName( code )
				} ) )
				.sort( ( a, b ) => collator.compare( a.name, b.name ) )
				.map( ( item ) => item.code );
		} );

		const languagesToDisplay =
			computed( () => {
				const isSearchingActive = searchQuery.value && searchQuery.value.trim().length > 0;
				let result = isSearchingActive ?
					searchResults.value : sortedAllCodes.value;

				if ( props.hideActiveLanguages ) {
					const selectedSet = new Set( selectedValues.value );
					result = result.filter( ( code ) => !selectedSet.has( code ) );
				}

				return result;
			} );

		// Progressive rendering of the large unfiltered "all languages" list:
		// render a screenful immediately, then fill in the rest over subsequent
		// frames so opening paints quickly. Small lists render in full at once.
		const { renderLimit, growTo } = useProgressiveRender();

		// Measured height of a rendered row, used to reserve space for rows not
		// yet progressively rendered. Seeded with a rough estimate (px) until
		// the first row is measured on mount.
		const rowHeight = ref( 40 );

		const visibleAllCodes = computed( () => {
			const all = languagesToDisplay.value;
			if ( searchQuery.value || all.length <= renderLimit.value ) {
				return all;
			}
			return all.slice( 0, renderLimit.value );
		} );

		watch( [ languagesToDisplay, searchQuery ], () => {
			if ( !searchQuery.value ) {
				growTo( languagesToDisplay.value.length );
			}
		}, { immediate: true } );

		const hasSearchHits = computed( () => Object.keys( searchQueryHits.value ).length > 0 );

		const languageCodes = computed( () => Object.keys( languages.value ) );

		const displayLanguageDir = computed( () => (
			props.displayLanguageCode ?
				( rtlLanguages.has( props.displayLanguageCode ) ? 'rtl' : 'ltr' ) :
				null
		) );

		const scrollHighlightedIntoView = async () => {
			await nextTick();
			// eslint-disable-next-line no-use-before-define
			if ( !highlightedItem.value ) {
				return;
			}

			const languageItem = keyboardNavigationContainer.value
				// eslint-disable-next-line no-use-before-define
				.querySelectorAll( '.uls-rewrite__language-item' )[ highlightedIndex.value ];
			if ( languageItem ) {
				languageItem.scrollIntoView( { block: 'nearest' } );
			}
		};

		const { addLanguageToHistory, previousLanguages } = useLanguageHistory();
		const { getSuggestedLanguages } = useSuggestedLanguages();
		const { preferredLanguages } = usePreferredLanguages();

		// Language suggestions present in the language selector
		const availableLanguageSuggestions =
			getSuggestedLanguages( previousLanguages, languageCodes );

		const unavailableLanguagesSet = computed( () => {
			const set = new Set();
			const validLanguageCodesSet = new Set( languageCodes.value );
			for ( const code of preferredLanguages.value ) {
				if ( !validLanguageCodesSet.has( code ) ) {
					set.add( code );
				}
			}
			return set;
		} );

		const highlightedLanguages = computed( () => {
			if ( searchQuery.value ) {
				return [];
			}

			let result;
			let limit = SUGGESTED_LANGUAGES_COUNT;
			if ( preferredLanguages.value.length > 0 ) {
				result = preferredLanguages.value;
				// Max allowed preferred languages
				limit = PREFERRED_LANGUAGES_COUNT;
			} else {
				if ( languageCodes.value.length < DENSITY_LOW_THRESHOLD ) {
					return [];
				}
				result = availableLanguageSuggestions.value;

				if ( props.hideActiveLanguages ) {
					const selectedSet = new Set( selectedValues.value );
					result = result.filter( ( code ) => !selectedSet.has( code ) );
				}
			}

			return result.slice( 0, limit );
		} );

		const densityClass = computed( () => {
			const count = languageCodes.value.length;
			// When there are no languages, use the medium width to allow spacing
			// for entrypoints and no languages message.
			if ( count === 0 ) {
				return 'uls-rewrite--density-medium';
			}

			if ( count < DENSITY_LOW_THRESHOLD ) {
				// With preferred languages, use the 2-column layout even with few languages
				return preferredLanguages.value.length > 0 ?
					'uls-rewrite--density-medium' :
					'uls-rewrite--density-low';
			}
			if ( count < DENSITY_MEDIUM_THRESHOLD ) {
				return 'uls-rewrite--density-medium';
			}
			return 'uls-rewrite--density-high';
		} );

		const highlightedLanguagesTitle = computed( () => {
			if ( preferredLanguages.value.length > 0 ) {
				return mw.msg( 'ext-uls-preferred-languages-title', highlightedLanguages.value.length );
			}

			return mw.msg( 'ext-uls-suggested-languages-title', highlightedLanguages.value.length );
		} );

		// Variants are only shown when there is no active search query
		const visibleVariantCodes = computed(
			() => ( searchQuery.value ? [] : currentVariantCodes.value )
		);

		// Whether the main view has anything to render: either languages or
		// variants.
		const hasDisplayableContent = computed(
			() => languagesToDisplay.value.length > 0 || visibleVariantCodes.value.length > 0
		);

		// Build a code -> annotation map, merging the caller-provided base
		// annotations with the resolved direction. extraByCode optionally layers
		// per-code annotations on top of the base (used by the variants section).
		// Object.assign ignores undefined/null sources, so a missing extra layer
		// is a no-op.
		const buildAnnotations = ( codes, extraByCode ) => {
			const annotations = {};
			for ( const code of codes ) {
				annotations[ code ] = Object.assign(
					{},
					props.languageAnnotations[ code ],
					extraByCode && extraByCode[ code ],
					{ dir: rtlLanguages.has( code ) ? 'rtl' : 'ltr' }
				);
			}
			return annotations;
		};

		// Annotations for the main "All languages" list.
		const baseAnnotations = computed(
			() => buildAnnotations( languageCodes.value )
		);

		// Annotations for the suggested/preferred languages section.
		const highlightedAnnotations = computed(
			() => buildAnnotations( highlightedLanguages.value )
		);

		// Annotations for the variants section. Variant codes are not in the main
		// language list, so they need their own map that also merges per-variant
		// annotations.
		const variantSectionAnnotations = computed(
			() => buildAnnotations( currentVariantCodes.value, currentVariantAnnotations.value )
		);

		// Declarative description of the main-view sections (variants, suggested,
		// all). The template renders these in order, and combinedLanguages is
		// derived from the same array so keyboard navigation and DOM order stay
		// in sync. indexOffset is accumulated here instead of computed in the
		// template.
		const mainSections = computed( () => {
			const sections = [];
			let cursor = 0;

			if ( visibleVariantCodes.value.length > 0 ) {
				sections.push( {
					key: 'variants',
					modifierClass: 'uls-rewrite__section--variants',
					title: variantsTitle.value,
					codes: visibleVariantCodes.value,
					languages: currentVariants.value,
					annotations: variantSectionAnnotations.value,
					indexOffset: cursor
				} );
				cursor += visibleVariantCodes.value.length;
			}

			if ( highlightedLanguages.value.length > 0 ) {
				sections.push( {
					key: 'suggested',
					modifierClass: 'uls-rewrite__section--suggested',
					title: highlightedLanguagesTitle.value,
					codes: highlightedLanguages.value,
					languages: languages.value,
					annotations: highlightedAnnotations.value,
					indexOffset: cursor
				} );
				cursor += highlightedLanguages.value.length;
			}

			// Skip the "All languages" section entirely when there are no
			// languages (e.g. variants-only view), so it does not render a
			// stray empty section with an "All languages (0)" title.
			if ( visibleAllCodes.value.length > 0 ) {
				sections.push( {
					key: 'all',
					modifierClass: 'uls-rewrite__section--all',
					// Only show the "All languages" title when at least one other
					// section is present above it. The count reflects the full list,
					// not the progressively-rendered subset.
					title: sections.length > 0 ?
						mw.msg( 'ext-uls-all-languages-title', languagesToDisplay.value.length ) :
						null,
					codes: visibleAllCodes.value,
					languages: languages.value,
					annotations: baseAnnotations.value,
					indexOffset: cursor,
					// Height to reserve for the rows still being progressively
					// rendered, so the scrollbar does not shrink as they fill in.
					// visibleAllCodes is always a prefix of the full list, so the
					// difference is never negative.
					reservedHeight: ( languagesToDisplay.value.length -
						visibleAllCodes.value.length ) * rowHeight.value
				} );
			}

			return sections;
		} );

		// Space-separated ids of the rendered section listboxes, for the
		// combobox input's aria-controls. Empty when nothing is shown.
		const listboxIds = computed(
			() => mainSections.value
				.map( ( section ) => sectionListboxId( section.key ) )
				.join( ' ' ) || null
		);

		// Flat list of codes in render order; keyboard navigation walks this.
		const combinedLanguages = computed(
			() => mainSections.value.reduce(
				( codes, section ) => codes.concat( section.codes ),
				[]
			)
		);

		// Screen-reader-only announcement of the search result count.
		const searchStatus = ref( '' );
		watch( [ isSearching, searchQuery, combinedLanguages ], () => {
			if ( !searchQuery.value ) {
				searchStatus.value = '';
				return;
			}
			if ( isSearching.value ) {
				return;
			}
			const count = combinedLanguages.value.length;
			searchStatus.value = count === 0 ?
				mw.msg( 'ext-uls-search-results-none' ) :
				mw.msg( 'ext-uls-search-results-count', count );
		} );

		const {
			next,
			prev,
			highlightedItem,
			highlightedIndex,
			setHighlightedItem,
			highlightFirst,
			clearHighlightedItem
		} = useKeyboardNavigation( combinedLanguages, visible, scrollHighlightedIntoView );

		// Id of the highlighted option, mirrored into the input's
		// aria-activedescendant so screen readers track the highlight without
		// focus leaving the input. Null when nothing is highlighted.
		const activeOptionId = computed(
			() => highlightedIndex.value >= 0 ?
				`${ baseId }-option-${ highlightedIndex.value }` :
				null
		);

		// Clicking outside only closes the panel on desktop.
		// On mobile, the panel is fullscreen and has its own close button.
		const isClickOutsideActive = computed( () => visible.value && !isMobile.value );
		useClickOutside( menuRef, isClickOutsideActive, document, () => emit( 'close' ) );

		// On mobile the selector is a fullscreen modal (aria-modal="true"), but
		// the page behind it is still in the DOM: keep Tab focus inside.
		const isFocusTrapActive = computed( () => visible.value && isMobile.value );
		useFocusTrap( menuRef, isFocusTrapActive, document );

		const { autocompleteSuggestion, getAcceptedSuggestion } =
			useTypeahead( searchQuery, languagesToDisplay, languages, searchQueryHits );

		const select = ( languageCode, languageValue ) => {
			if ( unavailableLanguagesSet.value.has( languageCode ) ) {
				return;
			}
			setHighlightedItem( languageCode );
			addLanguageToHistory( languageCode );
			emit( 'select', { code: languageCode, value: languageValue } );
		};

		// Lookup that falls back to currently rendered variants so keyboard navigation
		// resolves codes that live in the variants section as well as the main list.
		const getLanguageValue = ( code ) => (
			languages.value[ code ] || currentVariants.value[ code ]
		);

		const onEnter = () => {
			if ( highlightedItem.value ) {
				select( highlightedItem.value, getLanguageValue( highlightedItem.value ) );
				return;
			}

			if ( autocompleteSuggestion.value && combinedLanguages.value.length > 0 ) {
				const firstItemCode = combinedLanguages.value[ 0 ];
				select( firstItemCode, getLanguageValue( firstItemCode ) );
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
			// The mobile focus trap may already have consumed this Tab press
			// to wrap focus; don't also accept the typeahead suggestion.
			if ( e.defaultPrevented ) {
				return;
			}
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

		// The IME icon uses document coordinates but the popup moves via a CSS
		// transform, so recompute the icon to track the popup when it moves.
		const repositionImeSelector = async () => {
			// Wait for the new transform to be applied before measuring offset().
			await nextTick();
			const input = menuRef.value &&
				menuRef.value.querySelector( '.uls-rewrite__search-active input' );
			const imeSelector = input && $( input ).data( 'imeselector' );
			if ( imeSelector ) {
				imeSelector.position();
			}
		};

		watch( floatingStyles, () => {
			if ( visible.value ) {
				repositionImeSelector();
			}
		} );

		const focusInput = async () => {
			// Wait for Floating UI to apply real coordinates before focusing.
			// Without this, the popup is still at its initial { top: 0, left: 0 }
			// when .focus() runs on first open, and the browser scrolls the
			// viewport to the top of the document to reveal it. T426954.
			if ( !isPositioned.value ) {
				await new Promise( ( resolve ) => {
					watch( isPositioned, () => resolve(), { once: true } );
				} );
			}
			await nextTick();
			searchInputRef.value.focus();
		};

		// Return focus to the trigger when the selector closes, per the modal
		// dialog pattern — but only when focus is still inside the selector (or
		// already lost to <body>). When the user closes it by clicking another
		// focusable control, that control keeps focus.
		const restoreFocusToTrigger = () => {
			const active = document.activeElement;
			const isFocusLost = !active || active === document.body;
			const isFocusInside = menuRef.value && menuRef.value.contains( active );
			if ( !isFocusLost && !isFocusInside ) {
				return;
			}

			const trigger = triggerElement.value;
			if ( trigger && typeof trigger.focus === 'function' ) {
				trigger.focus();
			}
		};

		watch( [ visible, isMobile ], async ( [ isVisible, mobile ], oldValues ) => {
			emit( 'visible-change', isVisible, mobile );
			toggleBodyScrollLock( isVisible && mobile );
			if ( isVisible ) {
				await focusInput();
			} else {
				currentView.value = VIEW.MAIN;
				clearSearchQuery();
				// Skip the immediate call on mount: the selector was never
				// open, so there is no focus to give back.
				if ( oldValues && oldValues[ 0 ] ) {
					restoreFocusToTrigger();
				}
			}
		}, { immediate: true } );

		watch( currentView, async ( newView ) => {
			await nextTick();
			if ( newView === VIEW.MAIN ) {
				await focusInput();
			} else if ( panelHeaderRef.value ) {
				panelHeaderRef.value.focusTitle();
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

		const {
			quickActionEntrypoints,
			emptyLanguageListEntrypoints,
			emptySearchEntrypoints,
			missingLanguageEntrypoints
		} = useEntrypoints( props.mode );

		// Language suggestions for the user, irrespective of what's available in the selector
		const userLanguageSuggestions = getSuggestedLanguages( previousLanguages );

		onMounted( () => {
			// Safari < 14 lacks addEventListener on MediaQueryList and only
			// supports the deprecated addListener API.
			if ( mobileMediaQuery.addEventListener ) {
				mobileMediaQuery.addEventListener( 'change', onBreakpointChange );
			} else {
				mobileMediaQuery.addListener( onBreakpointChange );
			}

			// Measure a real row so reserved-height for not-yet-rendered rows
			// matches actual layout, keeping the scrollbar stable as the list
			// fills in.
			if ( keyboardNavigationContainer.value ) {
				const firstItem = keyboardNavigationContainer.value
					.querySelector( '.uls-rewrite__language-item' );
				if ( firstItem && firstItem.offsetHeight ) {
					rowHeight.value = firstItem.offsetHeight;
				}
			}
		} );

		onUnmounted( () => {
			if ( mobileMediaQuery.removeEventListener ) {
				mobileMediaQuery.removeEventListener( 'change', onBreakpointChange );
			} else {
				mobileMediaQuery.removeListener( onBreakpointChange );
			}
			toggleBodyScrollLock( false );
		} );

		return {
			// Template Refs
			menuRef,
			searchInputRef,
			keyboardNavigationContainer,
			panelHeaderRef,

			// ARIA wiring
			baseId,
			sectionListboxId,
			listboxFallbackLabel,
			listboxIds,
			activeOptionId,
			searchStatus,

			// Search & Data Source
			languages,
			languagesToDisplay,
			mainSections,
			hasDisplayableContent,
			searchQuery,
			hasSearchHits,
			search,
			isSearching,
			autocompleteSuggestion,
			selectedValuesSet,
			unavailableLanguagesSet,
			searchQueryHits,
			displayLanguageDir,

			// Appearance & Layout
			floatingStyles,
			densityClass,
			isMobile,
			dialogAriaLabel,
			panelTitle,

			// Keyboard Navigation
			highlightedIndex,
			next,
			prev,
			onEnter,
			onKeyTab,
			onKeyRight,
			setHighlightedIndex,
			clearHighlightedItem,

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

			// Preferred languages
			preferredLanguages,

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
