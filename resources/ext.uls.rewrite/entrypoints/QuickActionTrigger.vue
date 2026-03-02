<template>
	<template v-if="isSingleAction">
		<a
			v-if="actionToDisplay.url"
			:href="actionToDisplay.url"
			class="uls-quick-action-trigger cdx-button cdx-button--weight-quiet cdx-button--icon-only"
			:aria-label="actionToDisplay.label"
		>
			<cdx-icon :icon="actionToDisplay.icon"></cdx-icon>
		</a>
		<cdx-button
			v-else
			class="uls-quick-action-trigger cdx-button cdx-button--weight-quiet cdx-button--icon-only"
			:aria-label="actionToDisplay.label"
			@click="actionToDisplay.handler"
		>
			<cdx-icon :icon="actionToDisplay.icon"></cdx-icon>
		</cdx-button>
	</template>
	<cdx-button
		v-else-if="actionToDisplay"
		class="uls-quick-action-trigger"
		weight="quiet"
		:aria-label="actionToDisplay.label"
		@click="onTriggerClick"
	>
		<cdx-icon :icon="actionToDisplay.icon"></cdx-icon>
	</cdx-button>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const { CdxButton, CdxIcon } = require( '../../codex.js' );
const { cdxIconEllipsis } = require( '../../icons.json' );

module.exports = defineComponent( {
	name: 'QuickActionTrigger',
	components: {
		CdxButton,
		CdxIcon
	},
	props: {
		quickActions: {
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
			searchQuery: props.searchQuery,
			searchQueryHits: props.searchQueryHits
		} ) );

		const quickActionEntrypoints = computed( () => props.quickActions
			.filter( ( entryPoint ) => entryPoint.shouldShow( context.value ) )
			.map( ( entryPoint ) => entryPoint.getConfig( context.value ) )
			.filter( ( config ) => config !== null && ( Array.isArray( config ) ? config.length > 0 : true ) )
			.reduce( ( acc, val ) => acc.concat( val ), [] ) );

		const isSingleAction = computed( () => quickActionEntrypoints.value.length === 1 );

		const actionToDisplay = computed( () => {
			if ( quickActionEntrypoints.value.length === 0 ) {
				return null;
			}
			if ( quickActionEntrypoints.value.length === 1 ) {
				return quickActionEntrypoints.value[ 0 ];
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
				// TODO: Display the list of actions in a separate panel.
				emit( 'trigger', null );
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
