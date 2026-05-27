<template>
	<div class="uls-rewrite__missing-languages-panel">
		<p class="uls-rewrite__missing-languages-panel__description">
			{{ $i18n( 'ext-uls-missing-languages-panel-description' ) }}
		</p>
		<div class="uls-rewrite__missing-languages-panel__actions">
			<entrypoint-action-button
				v-for="( action, index ) in limitedActions"
				:key="index"
				:action="action"
				icon-size="small"
			></entrypoint-action-button>
		</div>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const EntrypointActionButton = require( './EntrypointActionButton.vue' );

module.exports = defineComponent( {
	name: 'MissingLanguagesPanel',
	components: {
		EntrypointActionButton
	},
	props: {
		actions: {
			type: Array,
			required: true
		}
	},
	setup( props ) {
		const maxMissingLanguagesToDisplay = 4;
		const limitedActions = computed(
			() => props.actions.slice( 0, maxMissingLanguagesToDisplay )
		);
		return {
			limitedActions
		};
	}
} );
</script>
