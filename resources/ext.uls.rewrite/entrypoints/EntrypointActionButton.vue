<template>
	<a
		v-if="action.url"
		:href="action.url"
		:aria-label="action.ariaLabel || null"
		class="cdx-button cdx-button--fake-button cdx-button--fake-button--enabled
			cdx-button--weight-quiet uls-rewrite__entrypoint-action-button"
		:class="`cdx-button--action-${ buttonAction }`"
	>
		<cdx-icon
			v-if="action.icon"
			:icon="action.icon"
			:size="iconSize"
		></cdx-icon>
		{{ action.label }}
	</a>
	<cdx-button
		v-else
		weight="quiet"
		:action="buttonAction"
		:aria-label="action.ariaLabel || null"
		class="uls-rewrite__entrypoint-action-button"
		@click="action.handler"
	>
		<cdx-icon
			v-if="action.icon"
			:icon="action.icon"
			:size="iconSize"
		></cdx-icon>
		{{ action.label }}
	</cdx-button>
</template>

<script>
const { defineComponent } = require( 'vue' );
const { CdxButton, CdxIcon } = require( '../../codex.js' );

/**
 * Renders a single entrypoint action. When the action has a `url` it is a
 * link styled as a quiet progressive button; otherwise it is a quiet
 * progressive button that invokes `handler` on click.
 */
module.exports = exports = defineComponent( {
	name: 'EntrypointActionButton',
	components: {
		CdxButton,
		CdxIcon
	},
	props: {
		// An entrypoint action config: { label, icon?, url?, handler?, ariaLabel? }.
		action: {
			type: Object,
			required: true
		},
		iconSize: {
			type: String,
			default: 'medium'
		},
		// Codex button action type ('default', 'progressive', 'destructive').
		buttonAction: {
			type: String,
			default: 'progressive'
		}
	}
} );
</script>
