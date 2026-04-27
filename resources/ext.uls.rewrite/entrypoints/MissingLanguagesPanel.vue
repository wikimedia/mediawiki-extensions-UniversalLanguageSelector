<template>
	<div class="uls-rewrite__missing-languages-panel">
		<p class="uls-rewrite__missing-languages-panel__description">
			{{ $i18n( 'ext-uls-missing-languages-panel-description' ) }}
		</p>
		<div class="uls-rewrite__missing-languages-panel__actions">
			<template
				v-for="( action, index ) in limitedActions"
				:key="index"
			>
				<a
					v-if="action.url"
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
			</template>
		</div>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const { CdxButton, CdxIcon } = require( '../../codex.js' );

module.exports = defineComponent( {
	name: 'MissingLanguagesPanel',
	components: {
		CdxButton,
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
