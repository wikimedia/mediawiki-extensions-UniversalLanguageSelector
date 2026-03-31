<template>
	<div class="uls-rewrite__quick-actions-panel">
		<div
			v-for="( action, index ) in quickActionsEntrypoints"
			:key="index"
			class="uls-rewrite__quick-actions-panel__action"
		>
			<a
				v-if="action.url"
				:href="action.url"
				class="cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--action-progressive cdx-button--weight-quiet"
			>
				<cdx-icon
					v-if="action.icon"
					:icon="action.icon"
					size="small"
				></cdx-icon>
				{{ action.label }}
			</a>
			<cdx-button
				v-else
				weight="quiet"
				action="progressive"
				@click="action.handler"
			>
				<cdx-icon
					v-if="action.icon"
					:icon="action.icon"
					size="small"
				></cdx-icon>
				{{ action.label }}
			</cdx-button>
		</div>
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );
const { CdxButton, CdxIcon } = require( '../../codex.js' );

module.exports = defineComponent( {
	name: 'QuickActionsPanel',
	components: {
		CdxButton,
		CdxIcon
	},
	props: {
		quickActionsEntrypoints: {
			type: Array,
			required: true
		}
	}
} );
</script>
