<template>
	<div>
		<p>{{ $i18n( 'ext-uls-empty-search-entrypoint-description' ) }}</p>
		<div class="uls-rewrite__empty-search-entrypoint__actions">
			<entrypoint-action-button
				v-for="( action, index ) in actions"
				:key="index"
				:action="action"
			></entrypoint-action-button>
		</div>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const useEntrypointActions = require( '../composables/useEntrypointActions.js' );
const EntrypointActionButton = require( './EntrypointActionButton.vue' );

module.exports = defineComponent( {
	name: 'EmptySearchEntrypoint',
	components: {
		EntrypointActionButton
	},
	props: {
		entrypoints: {
			type: Array,
			required: true
		},
		languages: {
			type: Object,
			default: () => {}
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
	setup( props ) {
		const context = computed( () => ( {
			languages: props.languages,
			suggestions: props.suggestions,
			preferredLanguages: props.preferredLanguages,
			searchQuery: props.searchQuery,
			searchQueryHits: props.searchQueryHits
		} ) );

		const actions = useEntrypointActions( props.entrypoints, context );

		return {
			actions
		};
	}
} );
</script>
