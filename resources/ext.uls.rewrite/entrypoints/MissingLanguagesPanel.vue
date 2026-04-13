<template>
	<div class="uls-rewrite__missing-languages-panel">
		<p class="uls-rewrite__missing-languages-panel__description">
			{{ $i18n( 'ext-uls-missing-languages-panel-description' ) }}
		</p>
		<div class="uls-rewrite__missing-languages-panel__actions">
			<a
				v-for="( action, index ) in limitedActions"
				:key="index"
				:href="action.url"
				class="cdx-button
					cdx-button--fake-button
					cdx-button--fake-button--enabled
					cdx-button--action-progressive
					cdx-button--weight-quiet"
			>
				<cdx-icon
					v-if="action.icon"
					:icon="action.icon"
					size="small"
				></cdx-icon>
				{{ action.label }}
			</a>
		</div>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const { CdxIcon } = require( '../../codex.js' );

module.exports = defineComponent( {
	name: 'MissingLanguagesPanel',
	components: {
		CdxIcon
	},
	props: {
		actions: {
			type: Array,
			required: true
		}
	},
	setup( props ) {
		const maxMissingLanguagesToDisplay = 4;
		const limitedActions = computed( () => props.actions.slice( 0, maxMissingLanguagesToDisplay ) );

		return {
			limitedActions
		};
	}
} );
</script>
