<template>
	<div class="uls-rewrite__quick-actions-panel">
		<div
			v-for="( action, index ) in actions"
			:key="index"
			class="uls-rewrite__quick-actions-panel__action"
		>
			<entrypoint-action-button
				:action="action"
				icon-size="small"
			></entrypoint-action-button>
		</div>
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );
const EntrypointActionButton = require( './EntrypointActionButton.vue' );

module.exports = defineComponent( {
	name: 'QuickActionsPanel',
	components: {
		EntrypointActionButton
	},
	props: {
		actions: {
			type: Array,
			required: true
		}
	}
} );
</script>
