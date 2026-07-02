<template>
	<div v-if="actionToDisplay" class="uls-quick-action-trigger">
		<template v-if="isSingleAction">
			<a
				v-if="actionToDisplay.url"
				:href="actionToDisplay.url"
				class="cdx-button cdx-button--weight-quiet cdx-button--icon-only"
				:aria-label="actionToDisplay.label"
			>
				<cdx-icon :icon="actionToDisplay.icon"></cdx-icon>
			</a>
			<cdx-button
				v-else
				weight="quiet"
				icon-only
				:aria-label="actionToDisplay.label"
				@click.stop="actionToDisplay.handler"
			>
				<cdx-icon :icon="actionToDisplay.icon"></cdx-icon>
			</cdx-button>
		</template>
		<cdx-button
			v-else
			weight="quiet"
			icon-only
			:aria-label="actionToDisplay.label"
			@click.stop="onTriggerClick"
		>
			<cdx-icon :icon="actionToDisplay.icon"></cdx-icon>
		</cdx-button>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const { CdxButton, CdxIcon } = require( '../../codex.js' );
const { cdxIconEllipsis } = require( '../../icons.json' );
const useEntrypointActions = require( '../composables/useEntrypointActions.js' );

module.exports = exports = defineComponent( {
	name: 'QuickActionTrigger',
	components: {
		CdxButton,
		CdxIcon
	},
	props: {
		entrypoints: {
			type: Array,
			required: true
		},
		languages: {
			type: Array,
			default: () => []
		},
		suggestions: {
			type: Array,
			default: () => []
		},
		preferredLanguages: {
			type: Array,
			default: () => []
		},
		searchQuery: {
			type: String,
			default: null
		},
		searchQueryHits: {
			type: Object,
			default: null
		}
	},
	emits: [ 'trigger' ],
	setup( props, { emit } ) {
		const context = computed( () => ( {
			languages: props.languages,
			suggestions: props.suggestions,
			preferredLanguages: props.preferredLanguages,
			searchQuery: props.searchQuery,
			searchQueryHits: props.searchQueryHits
		} ) );

		const actions = useEntrypointActions( props.entrypoints, context );

		const isSingleAction = computed( () => actions.value.length === 1 );

		const actionToDisplay = computed( () => {
			if ( actions.value.length === 0 ) {
				return null;
			}
			if ( actions.value.length === 1 ) {
				return actions.value[ 0 ];
			}

			return {
				icon: cdxIconEllipsis,
				label: mw.msg( 'ext-uls-open-quick-actions' )
			};
		} );

		const onTriggerClick = () => {
			if ( !actionToDisplay.value ) {
				return;
			}

			if ( !isSingleAction.value ) {
				emit( 'trigger', actions.value );
			}
		};

		return {
			actionToDisplay,
			isSingleAction,
			onTriggerClick
		};
	}
} );
</script>
