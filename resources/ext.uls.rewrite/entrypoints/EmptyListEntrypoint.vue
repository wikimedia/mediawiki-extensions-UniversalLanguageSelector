<template>
	<div>
		<p>{{ $i18n( 'ext-uls-no-languages-entrypoint-description' ) }}</p>
		<div class="uls-rewrite__empty-list-entrypoint__actions">
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
	name: 'EmptyListEntrypoint',
	components: {
		EntrypointActionButton
	},
	props: {
		entrypoints: {
			type: Array,
			required: true
		},
		suggestions: {
			type: Array,
			required: true
		},
		preferredLanguages: {
			type: Array,
			default: () => []
		},
		languages: {
			type: Array,
			required: true
		}
	},
	setup( props ) {
		const context = computed( () => ( {
			suggestions: props.suggestions,
			preferredLanguages: props.preferredLanguages,
			languages: props.languages
		} ) );

		const actions = useEntrypointActions( props.entrypoints, context );

		return {
			actions
		};
	}
} );
</script>
